import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {S3} from 'aws-sdk';

// const bucketName = process.env.PHOTO_BUCKET_NAME!;
const bucketName = 'memerson-api-photos'
const s3 = new S3();

// TODO: Used gcd to caluclate aspect ratio
// TODO: return aspect ratio in additon to width and height
const gcd = (...arr: number[]): number => {
  const _gcd = (x: number, y: number): number => (!y ? x : gcd(y, x % y));
  return [...arr].reduce((a, b) => _gcd(a, b));
};

const generateUrl = async (object: S3.Object): Promise<{
  filename: string,
  url: string,
  width: number,
  height: number,
  aspect_ratio_width: number,
  aspect_ratio_height: number
}> => {
  const url = await s3.getSignedUrlPromise('getObject', {
      Bucket: bucketName,
      Key: object.Key,
      Expires: (60 * 60),
  })

  const regexp = /(?<width>[0-9]+)x(?<height>[0-9]+)/;
  const match = object.Key?.match(regexp)?.groups;

  const width = +(match?.width || '3');
  const height = +(match?.height || '2');
  console.log(`Width: ${width} / Height: ${height}.`);
  const i = gcd(width, height)
  const aspect_ratio_width = width / i
  const aspect_ratio_height = height / i

  return {
      filename: object.Key!,
      url,
      width,
      height,
      aspect_ratio_width,
      aspect_ratio_height
  }
}

export async function handler(event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> {
  console.log('event', JSON.stringify(event, null, 2));

  try {
    const {Contents: results} = await s3.listObjectsV2({
        Bucket: bucketName
    }).promise()

    const photos = await Promise.all(results!
      .filter((result: S3.Object) => result.Key?.includes('-20_'))
      .map((result: S3.Object) => generateUrl(result)))

    console.log('photos', JSON.stringify(photos, null, 2))

    return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Headers" : 'Content-Type',
          "Access-Control-Allow-Origin": event.headers.origin || 'https://memerson.net',
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
        },
        body: JSON.stringify(photos)
    }
  } catch (e: any) {
      return {
          statusCode: 500,
          body: e.message,
      }
  }
}

