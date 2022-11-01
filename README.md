# GitLab CI Yml Crawler

[![ci](https://github.com/jeeyo/gitlab-ci-yml-crawler/actions/workflows/ci.yml/badge.svg)](https://github.com/jeeyo/gitlab-ci-yml-crawler/actions/workflows/ci.yml)

**GitLab CI Yml Crawler** is a tool for crawling cloud GitLab or your organization GitLab to fetch each repository CI and publish to document-based NoSQL database for indexing.

Currently, GitLab CI Yml Crawler only support Couchbase through `CouchbaseRepository` but it is extensible by creating another repository class which implements `IDatabase` and then it will be easily pluggable to IoC container thanks to Inversify.js.

## Usage

```sh
docker run \
  jeeyo/gitlab-ci-yml-crawler:latest \
  gitlab.endpoint=https://gitlab.com/api/v4/ \
  gitlab.token=<YOUR_GITLAB_ACCESS_TOKEN> \
  gitlab.glob=**/** \
  db.host=couchbase://localhost \
  db.user=dbuser \
  db.pass=dbpass \
  db.bucket=dbbucket \
  loglevel=info
