#!/usr/bin/env node

import * as cdk from "@aws-cdk/core";
const envName = (process.env.ENV_NAME || "local").toLowerCase();
import { BandoServiceStack } from "./bando-service-stack";

const app = new cdk.App();
new BandoServiceStack(app, `${envName}-bando-service`);
