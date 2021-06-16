import { Bucket, BucketEncryption, IBucket } from '@aws-cdk/aws-s3';
import { BucketDeployment, Source } from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

interface S3BucketWithDeployProps {
    deployTo: string[];
    encryption: BucketEncryption;
}

export class S3BucketWithDeploy extends cdk.Construct {
    public readonly bucket: IBucket;
    constructor(scope: cdk.Construct, id: string, props: S3BucketWithDeployProps){
        super(scope, id);

        this.bucket = new Bucket(this, 'MySimpleAppBucket', {
            encryption: props.encryption,
            // encryption: props?.envName === 'prod' ? BucketEncryption.S3_MANAGED : BucketEncryption.UNENCRYPTED,
          });

          new BucketDeployment(this, 'MySimpleAppPhotos', {
            sources: [
              Source.asset(path.join(__dirname, ...props.deployTo))
            ],
            destinationBucket: this.bucket,
          });
        
    }
}