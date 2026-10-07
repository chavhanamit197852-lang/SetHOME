package com.sethome.sethome.config;

import java.net.URI;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class minioConfig {

    @Value("${storage.endpoint:http://localhost:8333}")
    private String endpoint;

    @Value("${storage.access-key:sethomeadmin}")
    private String accessKey;

    @Value("${storage.secret-key:sethomepassword}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {

        AwsBasicCredentials credentials =
                AwsBasicCredentials.create(
                        accessKey,
                        secretKey
                );

        return S3Client.builder()
                .endpointOverride(URI.create(endpoint))
                .region(Region.US_EAST_1)
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                credentials
                        )
                )
                .forcePathStyle(true)
                .build();
    }
}