#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleAppStack } from '../lib/simple-app-stack';

const app = new cdk.App();
new SimpleAppStack(app, 'SimpleAppStack');
// new SimpleAppStack(app, 'SimpleAppStack-dev', {
//   env: {region: 'eu-central-1'},
//   envName: 'dev'
// });

// new SimpleAppStack(app, 'SimpleAppStack-prod', {
//   env: {region: 'eu-west-2'},
//   envName: 'prod'
// });
