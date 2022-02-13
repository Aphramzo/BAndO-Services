# BAndO-Services

Backend services to support the brokkandodin.com site

## Deployments

All deployments are handled via github actions and defined by AWS CDK. To deploy to the test environment, simply create
a pull request to main and add a `test` label. Your branch must be up to date with main, otherwise it will fail.

_NOTE_ To successfully deploy the stack, your aws credentials will need admin account access to create the cognito resources.

After testing is complete, adding the `deploy` label will deploy the branch to the production env and merge to main.

## Endpoints

### GET /images/{pageNumber}/{perPage}

Returns array of recent `iImage` for the given page

```json
[
  {
    "date": "2021-10-17 11:38:43",
    "description": "Had to strip down by the end and get our sillies out",
    "largeHeight": 1024,
    "largeWidth": 768,
    "smallHeight": 320,
    "smallWidth": 240,
    "tags": ["hiking"],
    "urlLarge": "someURL.jpg",
    "urlOriginal": "OGUrl.jpg",
    "urlSmall": "smallURL.jpg",
    "video": false,
    "videoUrl": "videoUrl"
  },
  {
    "date": "2021-10-17 10:13:12",
    "description": "Made it all the way to Idaho Springs Reservoir this trip.",
    "largeHeight": 1024,
    "largeWidth": 768,
    "smallHeight": 320,
    "smallWidth": 240,
    "tags": ["backpacking"],
    "urlLarge": "someURL.jpg",
    "urlOriginal": "OGUrl.jpg",
    "urlSmall": "smallURL.jpg",
    "video": false,
    "videoUrl": "videoUrl"
  }
]
```
