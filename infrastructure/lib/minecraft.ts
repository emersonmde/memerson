import * as cdk from "@aws-cdk/core";
import * as route53 from "@aws-cdk/aws-route53";
import * as ec2 from "@aws-cdk/aws-ec2";


export interface MinecraftStackProps extends cdk.StackProps {
  hostedZone: route53.PublicHostedZone;
}

export class MinecraftStack extends cdk.Stack {

  constructor(scope: cdk.Construct, id: string, props: MinecraftStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'MinecraftVpc', {
      cidr: '10.0.0.0/16',
      natGateways: 0,
      subnetConfiguration: [
        {name: 'public', cidrMask: 24, subnetType: ec2.SubnetType.PUBLIC},
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, 'MinecraftSg', {
      vpc,
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      'allow SSH access from anywhere',
    );

    securityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(25565),
      'allow minecraft traffic from anywhere',
    );

    const server = new ec2.Instance(this, 'MinecraftServer', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: securityGroup,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.SMALL,
      ),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: 'memerson-mbp',
    });

    new route53.ARecord(this, 'MinecraftARecord', {
      zone: props.hostedZone,
      recordName: 'minecraft',
      target: route53.RecordTarget.fromIpAddresses(server.instancePublicIp),
      ttl: cdk.Duration.hours(1),
    });
  }
}