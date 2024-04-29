## Building

In order to produce the needed deployment zip file, run the following command:

```bash
cargo lambda build --output-format zip
```

This will produce a zip file for each of the Lambdas located at `target/lambda/function_name/bootstrap.zip`

## Testing

To test a Lambda function locally, run:

```bash
cargo lambda watch
```

Then invoke the Lambda function using:

```bash
aws lambda invoke function_name --data-file ./path/to/input.json
```