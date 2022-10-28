# GitLab CI Yml Crawler

[![ci](https://github.com/jeeyo/gitlab-ci-yml-crawler/actions/workflows/ci.yml/badge.svg)](https://github.com/jeeyo/gitlab-ci-yml-crawler/actions/workflows/ci.yml)

**GitLab CI Yml Crawler** is a tool for crawling cloud GitLab or your organization GitLab to fetch each repository CI and publish to document-based NoSQL database for indexing.

Currently, GitLab CI Yml Crawler only support Couchbase through `CouchbaseRepository` but it is extensible by creating another repository class which implements `IDatabase` and then it will be easily pluggable to IoC container thanks to Inversify.js.

## Usage

```sh
docker run \
  -e GITLAB_API_ENDPOINT=https://gitlab.com/api/v4/ \
  -e GITLAB_API_TOKEN=<YOUR_GITLAB_ACCESS_TOKEN> \
  -e GITLAB_REPO_GLOB=**/** \
  -e DB_HOST=couchbase://localhost \
  -e DB_USER=dbuser \
  -e DB_PASS=dbpass \
  -e DB_BUCKET=dbbucket \
  -e LOG_LEVEL=info \
  jeeyo/gitlab-ci-yml-crawler:latest
