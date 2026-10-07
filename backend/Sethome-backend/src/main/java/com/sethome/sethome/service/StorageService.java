package com.sethome.sethome.service;

import java.io.InputStream;

import org.springframework.stereotype.Service;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class StorageService {

    private static final String BUCKET_NAME = "sethome";

    private final S3Client s3Client;

    public StorageService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public void upload(
            String storageKey,
            InputStream inputStream,
            long fileSize,
            String contentType
    ) throws Exception {

        ensureBucketExists();

        PutObjectRequest request =
                PutObjectRequest.builder()
                        .bucket(BUCKET_NAME)
                        .key(storageKey)
                        .contentType(contentType)
                        .contentLength(fileSize)
                        .build();

        s3Client.putObject(
                request,
                RequestBody.fromInputStream(
                        inputStream,
                        fileSize
                )
        );
    }

    public InputStream download(
            String storageKey
    ) {

        GetObjectRequest request =
                GetObjectRequest.builder()
                        .bucket(BUCKET_NAME)
                        .key(storageKey)
                        .build();

        return s3Client.getObject(request);
    }

    public void delete(
            String storageKey
    ) {

        DeleteObjectRequest request =
                DeleteObjectRequest.builder()
                        .bucket(BUCKET_NAME)
                        .key(storageKey)
                        .build();

        s3Client.deleteObject(request);
    }

    private void ensureBucketExists() {

        try {

            s3Client.headBucket(
                    HeadBucketRequest.builder()
                            .bucket(BUCKET_NAME)
                            .build()
            );

        } catch (NoSuchBucketException e) {

            s3Client.createBucket(
                    CreateBucketRequest.builder()
                            .bucket(BUCKET_NAME)
                            .build()
            );
        }
    }
}