import { Stack } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { Table, TableProps } from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaPath } from "./paths.type";

export class GenericTable {
  private table: Table;

  private createLambda: NodejsFunction;
  private readLambda: NodejsFunction;
  private updateLambda: NodejsFunction;
  private deleteLambda: NodejsFunction;

  public createLambdaIntegration: LambdaIntegration;
  public readLambdaIntegration: LambdaIntegration;
  public updateLambdaIntegration: LambdaIntegration;
  public deleteLambdaIntegration: LambdaIntegration;

  constructor(
    private stack: Stack,
    private props: TableProps,
    private lambdaPath: LambdaPath
  ) {
    this.props = props;
    this.initialize();
  }

  private initialize() {
    this.createTable();
    this.createLambdas();
    this.grantTableRights();
  }

  private createTable() {
    this.table = new Table(this.stack, "SpacesTable", this.props);
  }

  private createLambdas() {
    if (this.lambdaPath.create) {
      this.createLambda = this.createSingleLambda(this.lambdaPath.create);
      this.createLambdaIntegration = new LambdaIntegration(this.createLambda);
    }
    if (this.lambdaPath.read) {
      this.readLambda = this.createSingleLambda(this.lambdaPath.read);
      this.readLambdaIntegration = new LambdaIntegration(this.readLambda);
    }
    if (this.lambdaPath.update) {
      this.updateLambda = this.createSingleLambda(this.lambdaPath.update);
      this.updateLambdaIntegration = new LambdaIntegration(this.updateLambda);
    }
    if (this.lambdaPath.delete) {
      this.deleteLambda = this.createSingleLambda(this.lambdaPath.delete);
      this.deleteLambdaIntegration = new LambdaIntegration(this.deleteLambda);
    }
  }

  private createSingleLambda(lambdaName: string): NodejsFunction {
    const lambdaId = `${this.props.tableName}-${lambdaName}`;
    return new NodejsFunction(this.stack, lambdaId, {
      entry: `resources/SpacesTable/${lambdaName}.ts`,
      handler: "handler",
      functionName: lambdaId,
      environment: {
        TABLE_NAME: this.props.tableName!,
        PRIMARY_KEY: this.props.partitionKey.name,
      },
    });
  }

  private grantTableRights() {
    if (this.createLambda) {
      this.table.grantWriteData(this.createLambda);
    }
    if (this.readLambda) {
      this.table.grantReadData(this.readLambda);
    }
    if (this.updateLambda) {
      this.table.grantWriteData(this.updateLambda);
    }
    if (this.deleteLambda) {
      this.table.grantWriteData(this.deleteLambda);
    }
  }
}
