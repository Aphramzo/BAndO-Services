# BAndO-Services

Backend services to support the brokkandodin.com site

## Deployments

All deployments are handled via github actions and defined by AWS CDK. To deploy to the test environment, simply create
a pull request to main and add a `test` label. Your branch must be up to date with main, otherwise it will fail.

_NOTE_ To successfully deploy the stack, your aws credentials will need admin account access to create the cognito resources.

After testing is complete, adding the `deploy` label will deploy the branch to the production env and merge to main.

## Endpoints

### GET /images/{pageNumber}/{perPage}

Returns array of recent images for the given page
