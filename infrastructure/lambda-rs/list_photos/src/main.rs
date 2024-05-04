use std::collections::HashMap;

use anyhow::{Context, Result};
use aws_config::BehaviorVersion;
use aws_sdk_s3::operation::list_objects_v2::ListObjectsV2Output;
use lambda_http::{Body, Error, Request, Response, run, service_fn, tracing};
use lambda_http::http::HeaderValue;
use lambda_http::tracing::info;
use regex::Regex;
use serde::{Deserialize, Serialize};
use serde_json::json;

const CLOUDFRONT_BASE_URL: &'static str = "https://dno10sz1reifi.cloudfront.net";

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Photo {
    src: String,
    src_set: Vec<String>,
    width: u32,
    height: u32,
}

/// Get the dimensions from the standard filename format
///
/// All files should be named in the format `WxH.jpg` where W is the width and H is the height
fn get_dimensions(url: &str) -> (u32, u32) {
    let re: Regex = Regex::new(r"(\d+)x(\d+)").unwrap();
    if let Some(caps) = re.captures(url) {
        let width = caps[1].parse().unwrap_or(0);
        let height = caps[2].parse().unwrap_or(0);
        (width, height)
    } else {
        (0, 0)
    }
}

/// List all photos in the S3 bucket
async fn list_s3_photos() -> ListObjectsV2Output {
    let config = aws_config::load_defaults(BehaviorVersion::v2023_11_09()).await;
    let client = aws_sdk_s3::Client::new(&config);
    let response = client
        .list_objects_v2()
        .bucket("memersoncloudfrontstack-websiteassetsbucketedaf1a-1m9hxzii3d1ie")
        .prefix("photos/")
        .send()
        .await
        .unwrap();
    response
}

/// Get the src sets for all photos in the S3 bucket
///
/// The S3 bucket is expected to have a structure like:
/// ```
/// photos/{image_uuid}/{width}x{height}.jpg
/// ```
///
/// Each image_uuid will have multiple images of different sizes. This function will return a map
/// of the path up to the image_uuid and a value which is a vector of all the images file names
/// for that image_uuid.
async fn get_src_sets() -> Result<HashMap<String, Vec<String>>> {
    let response = list_s3_photos().await;
    let contents = response.contents.context("No contents in response")?;
    let mut photo_set: HashMap<String, Vec<String>> = contents
        .iter()
        .map(|object| {
            let key = object.key.as_deref().unwrap();
            key.rfind('/').map(|split| key.split_at(split))
        })
        .filter_map(|split| split)
        .fold(HashMap::new(), |mut acc, (prefix, key)| {
            acc.entry(prefix.to_string()).or_insert(vec![]).push(key.to_string());
            acc
        });
    for value in photo_set.values_mut() {
        value.sort_by_cached_key(|key| {
            let dimensions = get_dimensions(key);
            dimensions.0 * dimensions.1
        });
    }
    Ok(photo_set)
}

/// Construct a list of photos from the images found in S3
async fn get_photos() -> Result<Vec<Photo>> {
    let src_set = get_src_sets().await?;
    let photos: Vec<Photo> = src_set.iter()
        .map(|(prefix, keys)| {
            let smallest_photo = keys.first().unwrap();
            // TODO: memoize this for use in sorting and constructing Photo
            let dimensions = get_dimensions(smallest_photo);
            Photo {
                src: format!("{}/{}{}", CLOUDFRONT_BASE_URL, prefix, smallest_photo),
                src_set: keys.iter().map(|key| format!("{}/{}{}", CLOUDFRONT_BASE_URL, prefix, key)).collect(),
                width: dimensions.0,
                height: dimensions.1,
            }
        })
        .collect();
    Ok(photos)
}

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    info!("Incoming request: {:?}", event);

    let photos = get_photos().await?;
    info!("Returning {:?} photos", photos.len());

    let fallback_header = HeaderValue::from_static("https://memerson.dev, http://localhost:3000");
    let event_origin = event.headers().get("origin").unwrap_or(&fallback_header);
    let response = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .header("Access-Control-Allow-Headers", "Content-Type")
        .header("Access-Control-Allow-Origin", event_origin)
        .header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        .header("Content-Type", "application/json")
        .body(json!(photos).to_string().into())
        .map_err(Box::new)?;
    Ok(response)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
