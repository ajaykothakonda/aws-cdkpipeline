#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';



import { CdkpipelineStack } from '../lib/Cdkpipeline-stack';

const app = new cdk.App();

new CdkpipelineStack(app, 'CDKPipelineCdkStack', {

} )
