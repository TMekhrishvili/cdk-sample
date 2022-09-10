import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { RestApi } from "aws-cdk-lib/aws-apigateway";
import { GenericTable } from "./GenericTable";
import { AttributeType, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { LambdaPath } from "./paths.type";

export class CdkSampleStack extends cdk.Stack {
  private api = new RestApi(this, "hello-api");
  private props: TableProps = {
    tableName: "NewSpaceTable",
    partitionKey: {
      name: "spaceId",
      type: AttributeType.STRING,
    },
  };
  private spaceTable = new GenericTable(this, this.props, {
    create: "Create",
    read: "Read",
  } as LambdaPath);

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // lambda-api integration
    this.api.root.addMethod("GET", this.spaceTable.readLambdaIntegration);
    this.api.root.addMethod("POST", this.spaceTable.createLambdaIntegration);
  }
}
