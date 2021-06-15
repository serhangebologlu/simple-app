import { Bucket, BucketEncryption } from '@aws-cdk/aws-s3';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as cdk from '@aws-cdk/core';
import { Runtime } from '@aws-cdk/aws-lambda';
import * as path from 'path';
import {BucketDeployment, Source} from '@aws-cdk/aws-s3-deployment';
import { PolicyStatement } from '@aws-cdk/aws-iam';
import { CorsHttpMethod, HttpApi, HttpMethod } from '@aws-cdk/aws-apigatewayv2';
import { LambdaProxyIntegration } from '@aws-cdk/aws-apigatewayv2-integrations';
import {CloudFrontWebDistribution} from '@aws-cdk/aws-cloudfront';

interface SimpleAppStackProps extends cdk.StackProps {
  // envName: string
}

export class SimpleAppStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: SimpleAppStackProps) {
    super(scope, id, props);

    const bucket = new Bucket(this, 'MySimpleAppBucket', {
      encryption: BucketEncryption.S3_MANAGED,
      // encryption: props?.envName === 'prod' ? BucketEncryption.S3_MANAGED : BucketEncryption.UNENCRYPTED,
    });

    const websiteBucket = new Bucket(this, 'MySimpleAppWebSiteBucket', {
      websiteIndexDocument: 'index.html',
      publicReadAccess: true,
    });

    new BucketDeployment(this, 'MySimpleAppPhotos', {
      sources: [
        Source.asset(path.join(__dirname, '..', 'photos'))
      ],
      destinationBucket: bucket,
    });

    const cloudFront = new CloudFrontWebDistribution(this, 'MySimpleAppDistribution', {
      originConfigs:[
        {
          s3OriginSource:{
            s3BucketSource: websiteBucket,
          },
          behaviors: [{isDefaultBehavior: true}]
        }
      ] 
    });

    new BucketDeployment(this, 'MySimpleAppWebSiteDeploy', {
      sources: [
        Source.asset(path.join(__dirname, '..', '/frontend', 'build'))
      ],
      destinationBucket: websiteBucket,
      distribution: cloudFront,
    });

    const getPhotos = new lambda.NodejsFunction(this, 'MySimpleAppLambda', {
      runtime: Runtime.NODEJS_12_X,
      entry: path.join(__dirname, '..', 'api', 'get-photos', 'index.ts'),
      handler: 'getPhotos',
      environment: {
        PHOTO_BUCKET_NAME: bucket.bucketName
      },
    });

    const bucketContainerPermissions = new PolicyStatement();
    bucketContainerPermissions.addResources(bucket.bucketArn);
    bucketContainerPermissions.addActions('s3:ListBucket');

    const bucketPermissions = new PolicyStatement();
    bucketPermissions.addResources(`${bucket.bucketArn}/*`);
    bucketPermissions.addActions('s3:GetObject', 's3:PutObject');

    getPhotos.addToRolePolicy(bucketContainerPermissions);
    getPhotos.addToRolePolicy(bucketPermissions);

    const httpApi = new HttpApi(this, 'MySimpleAppHttpApi', {
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [CorsHttpMethod.GET ],
      },
      apiName: 'photo-api',
      createDefaultStage: true
    });

    const lambdaIntegration = new LambdaProxyIntegration({
      handler: getPhotos
    });

    httpApi.addRoutes({
      path: '/getAllPhotos',
      methods: [
        HttpMethod.GET,
      ],
      integration: lambdaIntegration
    });

    new cdk.CfnOutput(this, 'MySimpleAppBucketNameExport', {
      value: bucket.bucketName,
      exportName: `MySimpleAppBucketName`
      // exportName: `MySimpleAppBucketName${props?.envName}`
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebSiteBucketNameExport', {
      value: websiteBucket.bucketName,
      exportName: `MySimpleAppWebSiteBucketName`,
      // exportName: `MySimpleAppWebSiteBucketName${props?.envName}`,
    });

    new cdk.CfnOutput(this, 'MySimpleAppWebSiteUrl', {
      value: cloudFront.distributionDomainName,
      exportName: `MySimpleAppUrl`,
      // exportName: `MySimpleAppUrl${props?.envName}`,
    })

    new cdk.CfnOutput(this, 'MySimpleAppApiExport', {
      value: httpApi.url!,
      exportName: `MySimpleAppApi`,
      // exportName: `MySimpleAppApi${props?.envName}`,
    });

  }
}
