use anyhow::{Context, Result};
use aws_config::BehaviorVersion;
use lambda_http::{run, service_fn, tracing, Body, Error, Request, RequestExt, Response};
use regex::Regex;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Photo {
    src: String,
    src_set: Vec<String>,
    width: u32,
    height: u32,
}

fn get_dimensions(url: &str) -> (u32, u32) {
    let re = Regex::new(r"(\d+)x(\d+)").unwrap();
    if let Some(caps) = re.captures(url) {
        let width = caps[1].parse().unwrap_or(0);
        let height = caps[2].parse().unwrap_or(0);
        (width, height)
    } else {
        (0, 0)
    }
}

async fn list_s3_photos() -> Result<Vec<Photo>> {
    let config = aws_config::load_defaults(BehaviorVersion::v2023_11_09()).await;
    let client = aws_sdk_s3::Client::new(&config);
    let response = client
        .list_objects_v2()
        .bucket("memerson-public-photos")
        .send()
        .await
        .unwrap();
    let contents = response.contents.context("No contents in response")?;
    let photos = contents
        .iter()
        .map(|object| {
            let key = object.key.as_deref().unwrap();
            let src = format!("https://memerson-public-photos.s3.amazonaws.com/{}", &key);
            // TODO: Generate src_set
            let src_set = vec![];
            let (width, height) = get_dimensions(&key);
            Photo {
                src,
                src_set,
                width,
                height,
            }
        })
        .collect::<Vec<_>>();
    println!("Found photos: {:?}", photos);
    Ok(photos)
}

async fn function_handler(event: Request) -> Result<Response<Body>, Error> {
    println!("Incoming request: {:?}", event);

    let _ = list_s3_photos().await;

    // Extract some useful information from the request
    let who = event
        .query_string_parameters_ref()
        .and_then(|params| params.first("name"))
        .unwrap_or("world");
    let message = format!("Hello {who}, this is an AWS Lambda HTTP request");

    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(message.into())
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing::init_default_subscriber();

    run(service_fn(function_handler)).await
}
