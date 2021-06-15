#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { SimpleAppStack } from '../lib/simple-app-stack';
import { SimpleAppStackDns } from '../lib/simple-app-stack-dns';

const domainNameApex = 'cloudarchitectturkey.com'; 
const app = new cdk.App();

const {hostedZone, certificate} = new SimpleAppStackDns(app, 'SimpleAppStackDns', {
  dnsName: domainNameApex,
});

new SimpleAppStack(app, 'SimpleAppStack', {
  dnsName: domainNameApex,
  hostedZone,
  certificate
});
// new SimpleAppStack(app, 'SimpleAppStack-dev', {
//   env: {region: 'eu-central-1'},
//   envName: 'dev'
// });

// new SimpleAppStack(app, 'SimpleAppStack-prod', {
//   env: {region: 'eu-west-2'},
//   envName: 'prod'
// });
