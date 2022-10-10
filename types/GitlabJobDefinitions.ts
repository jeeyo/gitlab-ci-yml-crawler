import { z } from "zod";

export const schema = z
  .object({
    $schema: z.string().url().optional(),
    image: z
      .any()
      .superRefine((x, ctx) => {
        const schemas = [
          z
            .string()
            .min(1)
            .describe(
              "Full name of the image that should be used. It should contain the Registry part if needed."
            ),
          z
            .object({
              name: z
                .string()
                .min(1)
                .describe(
                  "Full name of the image that should be used. It should contain the Registry part if needed."
                ),
              entrypoint: z
                .array(z.any())
                .min(1)
                .describe(
                  "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                )
                .optional(),
              pull_policy: z
                .any()
                .superRefine((x, ctx) => {
                  const schemas = [
                    z.enum(["always", "never", "if-not-present"]),
                    z
                      .array(z.enum(["always", "never", "if-not-present"]))
                      .min(1),
                  ];
                  const errors = schemas.reduce(
                    (errors: z.ZodError[], schema) =>
                      ((result) =>
                        "error" in result ? [...errors, result.error] : errors)(
                        schema.safeParse(x)
                      ),
                    []
                  );
                  if (schemas.length - errors.length !== 1) {
                    ctx.addIssue({
                      path: ctx.path,
                      code: "invalid_union",
                      unionErrors: errors,
                      message: "Invalid input: Should pass single schema",
                    });
                  }
                })
                .optional(),
            })
            .strict()
            .describe(
              "Specifies the docker image to use for the job or globally for all jobs. Job configuration takes precedence over global setting. Requires a certain kind of Gitlab runner executor."
            ),
          z.array(z.string()),
        ];
        const errors = schemas.reduce(
          (errors: z.ZodError[], schema) =>
            ((result) =>
              "error" in result ? [...errors, result.error] : errors)(
              schema.safeParse(x)
            ),
          []
        );
        if (schemas.length - errors.length !== 1) {
          ctx.addIssue({
            path: ctx.path,
            code: "invalid_union",
            unionErrors: errors,
            message: "Invalid input: Should pass single schema",
          });
        }
      })
      .optional(),
    services: z
      .array(
        z.any().superRefine((x, ctx) => {
          const schemas = [
            z
              .string()
              .min(1)
              .describe(
                "Full name of the image that should be used. It should contain the Registry part if needed."
              ),
            z
              .object({
                name: z
                  .string()
                  .min(1)
                  .describe(
                    "Full name of the image that should be used. It should contain the Registry part if needed."
                  ),
                entrypoint: z
                  .array(z.string())
                  .min(1)
                  .describe(
                    "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                  )
                  .optional(),
                pull_policy: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.enum(["always", "never", "if-not-present"]),
                      z
                        .array(z.enum(["always", "never", "if-not-present"]))
                        .min(1),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .optional(),
                command: z
                  .array(z.string())
                  .min(1)
                  .describe(
                    "Command or script that should be used as the container's command. It will be translated to arguments passed to Docker after the image's name. The syntax is similar to Dockerfile's CMD directive, where each shell token is a separate string in the array."
                  )
                  .optional(),
                alias: z
                  .string()
                  .min(1)
                  .describe(
                    "Additional alias that can be used to access the service from the job's container. Read Accessing the services for more information."
                  )
                  .optional(),
              })
              .strict(),
          ];
          const errors = schemas.reduce(
            (errors: z.ZodError[], schema) =>
              ((result) =>
                "error" in result ? [...errors, result.error] : errors)(
                schema.safeParse(x)
              ),
            []
          );
          if (schemas.length - errors.length !== 1) {
            ctx.addIssue({
              path: ctx.path,
              code: "invalid_union",
              unionErrors: errors,
              message: "Invalid input: Should pass single schema",
            });
          }
        })
      )
      .optional(),
    before_script: z
      .array(z.union([z.string(), z.array(z.string())]))
      .optional(),
    after_script: z
      .array(z.union([z.string(), z.array(z.string())]))
      .optional(),
    variables: z.object({}).catchall(z.any()).optional(),
    cache: z.any().optional(),
    "!reference": z.array(z.string().min(1)).optional(),
    default: z
      .object({
        after_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        artifacts: z
          .object({
            paths: z.array(z.string()).min(1).optional(),
            exclude: z.array(z.string()).min(1).optional(),
            expose_as: z.string().optional(),
            name: z.string().optional(),
            untracked: z.boolean().optional(),
            when: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z
                    .enum(["on_success"])
                    .describe(
                      "Upload artifacts only when the job succeeds (this is the default)."
                    ),
                  z
                    .enum(["on_failure"])
                    .describe("Upload artifacts only when the job fails."),
                  z
                    .enum(["always"])
                    .describe("Upload artifacts regardless of job status."),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
            expire_in: z.string().optional(),
            reports: z
              .object({
                junit: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.string().describe("Path to a single XML file"),
                      z
                        .array(z.string())
                        .min(1)
                        .describe(
                          "A list of paths to XML files that will automatically be concatenated into a single file"
                        ),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path for file(s) that should be parsed as JUnit XML result"
                  )
                  .optional(),
                coverage_report: z
                  .object({
                    coverage_format: z
                      .enum(["cobertura"])
                      .describe(
                        "Code coverage format used by the test framework."
                      )
                      .optional(),
                    path: z
                      .string()
                      .min(1)
                      .describe(
                        "Path to the coverage report file that should be parsed."
                      )
                      .optional(),
                  })
                  .describe("Used to collect coverage reports from the job.")
                  .optional(),
                codequality: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with code quality report(s) (such as Code Climate)."
                  )
                  .optional(),
                dotenv: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing runtime-created variables for this job."
                  )
                  .optional(),
                lsif: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing code intelligence (Language Server Index Format)."
                  )
                  .optional(),
                sast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with SAST vulnerabilities report(s)."
                  )
                  .optional(),
                dependency_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Dependency scanning vulnerabilities report(s)."
                  )
                  .optional(),
                container_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Container scanning vulnerabilities report(s)."
                  )
                  .optional(),
                dast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with DAST vulnerabilities report(s)."
                  )
                  .optional(),
                license_management: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Deprecated in 12.8: Path to file or list of files with license report(s)."
                  )
                  .optional(),
                license_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with license report(s)."
                  )
                  .optional(),
                performance: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with performance metrics report(s)."
                  )
                  .optional(),
                requirements: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with requirements report(s)."
                  )
                  .optional(),
                secret_detection: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with secret detection report(s)."
                  )
                  .optional(),
                metrics: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with custom metrics report(s)."
                  )
                  .optional(),
                terraform: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with terraform plan(s)."
                  )
                  .optional(),
                cyclonedx: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
        before_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        cache: z.any().optional(),
        image: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .string()
                .min(1)
                .describe(
                  "Full name of the image that should be used. It should contain the Registry part if needed."
                ),
              z
                .object({
                  name: z
                    .string()
                    .min(1)
                    .describe(
                      "Full name of the image that should be used. It should contain the Registry part if needed."
                    ),
                  entrypoint: z
                    .array(z.any())
                    .min(1)
                    .describe(
                      "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                    )
                    .optional(),
                  pull_policy: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.enum(["always", "never", "if-not-present"]),
                        z
                          .array(z.enum(["always", "never", "if-not-present"]))
                          .min(1),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict()
                .describe(
                  "Specifies the docker image to use for the job or globally for all jobs. Job configuration takes precedence over global setting. Requires a certain kind of Gitlab runner executor."
                ),
              z.array(z.string()),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        interruptible: z.boolean().optional(),
        retry: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .number()
                .int()
                .gte(0)
                .lte(2)
                .describe(
                  "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                ),
              z
                .object({
                  max: z
                    .number()
                    .int()
                    .gte(0)
                    .lte(2)
                    .describe(
                      "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                    )
                    .optional(),
                  when: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .literal("always")
                              .describe("Retry on any failure (default)."),
                            z
                              .literal("unknown_failure")
                              .describe(
                                "Retry when the failure reason is unknown."
                              ),
                            z
                              .literal("script_failure")
                              .describe("Retry when the script failed."),
                            z
                              .literal("api_failure")
                              .describe("Retry on API failure."),
                            z
                              .literal("stuck_or_timeout_failure")
                              .describe(
                                "Retry when the job got stuck or timed out."
                              ),
                            z
                              .literal("runner_system_failure")
                              .describe(
                                "Retry if there is a runner system failure (for example, job setup failed)."
                              ),
                            z
                              .literal("runner_unsupported")
                              .describe("Retry if the runner is unsupported."),
                            z
                              .literal("stale_schedule")
                              .describe(
                                "Retry if a delayed job could not be executed."
                              ),
                            z
                              .literal("job_execution_timeout")
                              .describe(
                                "Retry if the script exceeded the maximum execution time set for the job."
                              ),
                            z
                              .literal("archived_failure")
                              .describe(
                                "Retry if the job is archived and can’t be run."
                              ),
                            z
                              .literal("unmet_prerequisites")
                              .describe(
                                "Retry if the job failed to complete prerequisite tasks."
                              ),
                            z
                              .literal("scheduler_failure")
                              .describe(
                                "Retry if the scheduler failed to assign the job to a runner."
                              ),
                            z
                              .literal("data_integrity_failure")
                              .describe(
                                "Retry if there is a structural integrity problem detected."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z.array(
                          z.any().superRefine((x, ctx) => {
                            const schemas = [
                              z
                                .literal("always")
                                .describe("Retry on any failure (default)."),
                              z
                                .literal("unknown_failure")
                                .describe(
                                  "Retry when the failure reason is unknown."
                                ),
                              z
                                .literal("script_failure")
                                .describe("Retry when the script failed."),
                              z
                                .literal("api_failure")
                                .describe("Retry on API failure."),
                              z
                                .literal("stuck_or_timeout_failure")
                                .describe(
                                  "Retry when the job got stuck or timed out."
                                ),
                              z
                                .literal("runner_system_failure")
                                .describe(
                                  "Retry if there is a runner system failure (for example, job setup failed)."
                                ),
                              z
                                .literal("runner_unsupported")
                                .describe(
                                  "Retry if the runner is unsupported."
                                ),
                              z
                                .literal("stale_schedule")
                                .describe(
                                  "Retry if a delayed job could not be executed."
                                ),
                              z
                                .literal("job_execution_timeout")
                                .describe(
                                  "Retry if the script exceeded the maximum execution time set for the job."
                                ),
                              z
                                .literal("archived_failure")
                                .describe(
                                  "Retry if the job is archived and can’t be run."
                                ),
                              z
                                .literal("unmet_prerequisites")
                                .describe(
                                  "Retry if the job failed to complete prerequisite tasks."
                                ),
                              z
                                .literal("scheduler_failure")
                                .describe(
                                  "Retry if the scheduler failed to assign the job to a runner."
                                ),
                              z
                                .literal("data_integrity_failure")
                                .describe(
                                  "Retry if there is a structural integrity problem detected."
                                ),
                            ];
                            const errors = schemas.reduce(
                              (errors: z.ZodError[], schema) =>
                                ((result) =>
                                  "error" in result
                                    ? [...errors, result.error]
                                    : errors)(schema.safeParse(x)),
                              []
                            );
                            if (schemas.length - errors.length !== 1) {
                              ctx.addIssue({
                                path: ctx.path,
                                code: "invalid_union",
                                unionErrors: errors,
                                message:
                                  "Invalid input: Should pass single schema",
                              });
                            }
                          })
                        ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        services: z
          .array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z
                  .string()
                  .min(1)
                  .describe(
                    "Full name of the image that should be used. It should contain the Registry part if needed."
                  ),
                z
                  .object({
                    name: z
                      .string()
                      .min(1)
                      .describe(
                        "Full name of the image that should be used. It should contain the Registry part if needed."
                      ),
                    entrypoint: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    pull_policy: z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z.enum(["always", "never", "if-not-present"]),
                          z
                            .array(
                              z.enum(["always", "never", "if-not-present"])
                            )
                            .min(1),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          []
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .optional(),
                    command: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be used as the container's command. It will be translated to arguments passed to Docker after the image's name. The syntax is similar to Dockerfile's CMD directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    alias: z
                      .string()
                      .min(1)
                      .describe(
                        "Additional alias that can be used to access the service from the job's container. Read Accessing the services for more information."
                      )
                      .optional(),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          )
          .optional(),
        tags: z
          .array(z.union([z.string().min(1), z.array(z.string())]))
          .optional(),
        timeout: z.string().min(1).optional(),
        "!reference": z.array(z.string().min(1)).optional(),
      })
      .strict()
      .optional(),
    stages: z.array(z.string()).min(1).optional(),
    include: z
      .any()
      .superRefine((x, ctx) => {
        const schemas = [
          z.any().superRefine((x, ctx) => {
            const schemas = [
              z
                .string()
                .regex(new RegExp("^(https?://|/).+\\.ya?ml$"))
                .describe(
                  "Will infer the method based on the value. E.g. `https://...` strings will be of type `include:remote`, and `/templates/...` will be of type `include:local`."
                ),
              z
                .object({
                  local: z
                    .string()
                    .regex(new RegExp("\\.ya?ml$"))
                    .describe(
                      "Relative path from local repository root (`/`) to the `yaml`/`yml` file template. The file must be on the same branch, and does not work across git submodules."
                    ),
                  rules: z
                    .array(
                      z.union([
                        z
                          .object({
                            if: z.string().optional(),
                            changes: z
                              .union([
                                z
                                  .object({
                                    paths: z
                                      .array(z.string())
                                      .describe("List of file paths."),
                                    compare_to: z
                                      .string()
                                      .describe("Ref for comparing changes.")
                                      .optional(),
                                  })
                                  .strict(),
                                z.array(z.string()),
                              ])
                              .optional(),
                            exists: z.array(z.string()).optional(),
                            variables: z
                              .object({})
                              .catchall(z.any())
                              .optional(),
                            when: z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z
                                    .enum(["on_success"])
                                    .describe(
                                      "Execute job only when all jobs from prior stages succeed."
                                    ),
                                  z
                                    .enum(["on_failure"])
                                    .describe(
                                      "Execute job when at least one job from prior stages fails."
                                    ),
                                  z
                                    .enum(["always"])
                                    .describe(
                                      "Execute job regardless of the status from prior stages."
                                    ),
                                  z.enum(["manual"]),
                                  z.enum(["delayed"]),
                                  z
                                    .enum(["never"])
                                    .describe("Never execute the job."),
                                ];
                                const errors = schemas.reduce(
                                  (errors: z.ZodError[], schema) =>
                                    ((result) =>
                                      "error" in result
                                        ? [...errors, result.error]
                                        : errors)(schema.safeParse(x)),
                                  []
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: "invalid_union",
                                    unionErrors: errors,
                                    message:
                                      "Invalid input: Should pass single schema",
                                  });
                                }
                              })
                              .optional(),
                            start_in: z.string().min(1).optional(),
                            allow_failure: z
                              .any()
                              .superRefine((x, ctx) => {
                                const schemas = [
                                  z
                                    .boolean()
                                    .describe(
                                      "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                                    ),
                                  z
                                    .object({ exit_codes: z.number().int() })
                                    .strict()
                                    .describe(
                                      "Exit code that are not considered failure. The job fails for any other exit code."
                                    ),
                                  z
                                    .object({
                                      exit_codes: z
                                        .array(z.number().int())
                                        .min(1),
                                    })
                                    .strict()
                                    .describe(
                                      "You can list which exit codes are not considered failures. The job fails for any other exit code."
                                    ),
                                ];
                                const errors = schemas.reduce(
                                  (errors: z.ZodError[], schema) =>
                                    ((result) =>
                                      "error" in result
                                        ? [...errors, result.error]
                                        : errors)(schema.safeParse(x)),
                                  []
                                );
                                if (schemas.length - errors.length !== 1) {
                                  ctx.addIssue({
                                    path: ctx.path,
                                    code: "invalid_union",
                                    unionErrors: errors,
                                    message:
                                      "Invalid input: Should pass single schema",
                                  });
                                }
                              })
                              .optional(),
                          })
                          .strict(),
                        z.string().min(1),
                        z.array(z.string()),
                      ])
                    )
                    .optional(),
                })
                .strict(),
              z
                .object({
                  project: z
                    .string()
                    .regex(new RegExp("\\S/\\S|\\$(\\S+)"))
                    .describe(
                      "Path to the project, e.g. `group/project`, or `group/sub-group/project`."
                    ),
                  ref: z
                    .string()
                    .describe("Branch/Tag/Commit-hash for the target project.")
                    .optional(),
                  file: z.any().superRefine((x, ctx) => {
                    const schemas = [
                      z
                        .string()
                        .regex(new RegExp("\\.ya?ml$"))
                        .describe(
                          "Relative path from project root (`/`) to the `yaml`/`yml` file template."
                        ),
                      z
                        .array(z.string().regex(new RegExp("\\.ya?ml$")))
                        .describe(
                          "List of files by relative path from project root (`/`) to the `yaml`/`yml` file template."
                        ),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  }),
                })
                .strict(),
              z
                .object({
                  template: z
                    .string()
                    .regex(new RegExp("\\.ya?ml$"))
                    .describe(
                      "Use a `.gitlab-ci.yml` template as a base, e.g. `Nodejs.gitlab-ci.yml`."
                    ),
                })
                .strict(),
              z
                .object({
                  remote: z
                    .string()
                    .regex(new RegExp("^https?://.+\\.ya?ml$"))
                    .describe(
                      "URL to a `yaml`/`yml` template file using HTTP/HTTPS."
                    ),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          }),
          z.array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z
                  .string()
                  .regex(new RegExp("^(https?://|/).+\\.ya?ml$"))
                  .describe(
                    "Will infer the method based on the value. E.g. `https://...` strings will be of type `include:remote`, and `/templates/...` will be of type `include:local`."
                  ),
                z
                  .object({
                    local: z
                      .string()
                      .regex(new RegExp("\\.ya?ml$"))
                      .describe(
                        "Relative path from local repository root (`/`) to the `yaml`/`yml` file template. The file must be on the same branch, and does not work across git submodules."
                      ),
                    rules: z
                      .array(
                        z.union([
                          z
                            .object({
                              if: z.string().optional(),
                              changes: z
                                .union([
                                  z
                                    .object({
                                      paths: z
                                        .array(z.string())
                                        .describe("List of file paths."),
                                      compare_to: z
                                        .string()
                                        .describe("Ref for comparing changes.")
                                        .optional(),
                                    })
                                    .strict(),
                                  z.array(z.string()),
                                ])
                                .optional(),
                              exists: z.array(z.string()).optional(),
                              variables: z
                                .object({})
                                .catchall(z.any())
                                .optional(),
                              when: z
                                .any()
                                .superRefine((x, ctx) => {
                                  const schemas = [
                                    z
                                      .enum(["on_success"])
                                      .describe(
                                        "Execute job only when all jobs from prior stages succeed."
                                      ),
                                    z
                                      .enum(["on_failure"])
                                      .describe(
                                        "Execute job when at least one job from prior stages fails."
                                      ),
                                    z
                                      .enum(["always"])
                                      .describe(
                                        "Execute job regardless of the status from prior stages."
                                      ),
                                    z.enum(["manual"]),
                                    z.enum(["delayed"]),
                                    z
                                      .enum(["never"])
                                      .describe("Never execute the job."),
                                  ];
                                  const errors = schemas.reduce(
                                    (errors: z.ZodError[], schema) =>
                                      ((result) =>
                                        "error" in result
                                          ? [...errors, result.error]
                                          : errors)(schema.safeParse(x)),
                                    []
                                  );
                                  if (schemas.length - errors.length !== 1) {
                                    ctx.addIssue({
                                      path: ctx.path,
                                      code: "invalid_union",
                                      unionErrors: errors,
                                      message:
                                        "Invalid input: Should pass single schema",
                                    });
                                  }
                                })
                                .optional(),
                              start_in: z.string().min(1).optional(),
                              allow_failure: z
                                .any()
                                .superRefine((x, ctx) => {
                                  const schemas = [
                                    z
                                      .boolean()
                                      .describe(
                                        "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                                      ),
                                    z
                                      .object({ exit_codes: z.number().int() })
                                      .strict()
                                      .describe(
                                        "Exit code that are not considered failure. The job fails for any other exit code."
                                      ),
                                    z
                                      .object({
                                        exit_codes: z
                                          .array(z.number().int())
                                          .min(1),
                                      })
                                      .strict()
                                      .describe(
                                        "You can list which exit codes are not considered failures. The job fails for any other exit code."
                                      ),
                                  ];
                                  const errors = schemas.reduce(
                                    (errors: z.ZodError[], schema) =>
                                      ((result) =>
                                        "error" in result
                                          ? [...errors, result.error]
                                          : errors)(schema.safeParse(x)),
                                    []
                                  );
                                  if (schemas.length - errors.length !== 1) {
                                    ctx.addIssue({
                                      path: ctx.path,
                                      code: "invalid_union",
                                      unionErrors: errors,
                                      message:
                                        "Invalid input: Should pass single schema",
                                    });
                                  }
                                })
                                .optional(),
                            })
                            .strict(),
                          z.string().min(1),
                          z.array(z.string()),
                        ])
                      )
                      .optional(),
                  })
                  .strict(),
                z
                  .object({
                    project: z
                      .string()
                      .regex(new RegExp("\\S/\\S|\\$(\\S+)"))
                      .describe(
                        "Path to the project, e.g. `group/project`, or `group/sub-group/project`."
                      ),
                    ref: z
                      .string()
                      .describe(
                        "Branch/Tag/Commit-hash for the target project."
                      )
                      .optional(),
                    file: z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .string()
                          .regex(new RegExp("\\.ya?ml$"))
                          .describe(
                            "Relative path from project root (`/`) to the `yaml`/`yml` file template."
                          ),
                        z
                          .array(z.string().regex(new RegExp("\\.ya?ml$")))
                          .describe(
                            "List of files by relative path from project root (`/`) to the `yaml`/`yml` file template."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    }),
                  })
                  .strict(),
                z
                  .object({
                    template: z
                      .string()
                      .regex(new RegExp("\\.ya?ml$"))
                      .describe(
                        "Use a `.gitlab-ci.yml` template as a base, e.g. `Nodejs.gitlab-ci.yml`."
                      ),
                  })
                  .strict(),
                z
                  .object({
                    remote: z
                      .string()
                      .regex(new RegExp("^https?://.+\\.ya?ml$"))
                      .describe(
                        "URL to a `yaml`/`yml` template file using HTTP/HTTPS."
                      ),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          ),
        ];
        const errors = schemas.reduce(
          (errors: z.ZodError[], schema) =>
            ((result) =>
              "error" in result ? [...errors, result.error] : errors)(
              schema.safeParse(x)
            ),
          []
        );
        if (schemas.length - errors.length !== 1) {
          ctx.addIssue({
            path: ctx.path,
            code: "invalid_union",
            unionErrors: errors,
            message: "Invalid input: Should pass single schema",
          });
        }
      })
      .optional(),
    pages: z
      .object({
        image: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .string()
                .min(1)
                .describe(
                  "Full name of the image that should be used. It should contain the Registry part if needed."
                ),
              z
                .object({
                  name: z
                    .string()
                    .min(1)
                    .describe(
                      "Full name of the image that should be used. It should contain the Registry part if needed."
                    ),
                  entrypoint: z
                    .array(z.any())
                    .min(1)
                    .describe(
                      "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                    )
                    .optional(),
                  pull_policy: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.enum(["always", "never", "if-not-present"]),
                        z
                          .array(z.enum(["always", "never", "if-not-present"]))
                          .min(1),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict()
                .describe(
                  "Specifies the docker image to use for the job or globally for all jobs. Job configuration takes precedence over global setting. Requires a certain kind of Gitlab runner executor."
                ),
              z.array(z.string()),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        services: z
          .array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z
                  .string()
                  .min(1)
                  .describe(
                    "Full name of the image that should be used. It should contain the Registry part if needed."
                  ),
                z
                  .object({
                    name: z
                      .string()
                      .min(1)
                      .describe(
                        "Full name of the image that should be used. It should contain the Registry part if needed."
                      ),
                    entrypoint: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    pull_policy: z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z.enum(["always", "never", "if-not-present"]),
                          z
                            .array(
                              z.enum(["always", "never", "if-not-present"])
                            )
                            .min(1),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          []
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .optional(),
                    command: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be used as the container's command. It will be translated to arguments passed to Docker after the image's name. The syntax is similar to Dockerfile's CMD directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    alias: z
                      .string()
                      .min(1)
                      .describe(
                        "Additional alias that can be used to access the service from the job's container. Read Accessing the services for more information."
                      )
                      .optional(),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          )
          .optional(),
        before_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        after_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        rules: z
          .array(
            z.union([
              z
                .object({
                  if: z.string().optional(),
                  changes: z
                    .union([
                      z
                        .object({
                          paths: z
                            .array(z.string())
                            .describe("List of file paths."),
                          compare_to: z
                            .string()
                            .describe("Ref for comparing changes.")
                            .optional(),
                        })
                        .strict(),
                      z.array(z.string()),
                    ])
                    .optional(),
                  exists: z.array(z.string()).optional(),
                  variables: z.object({}).catchall(z.any()).optional(),
                  when: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["on_success"])
                          .describe(
                            "Execute job only when all jobs from prior stages succeed."
                          ),
                        z
                          .enum(["on_failure"])
                          .describe(
                            "Execute job when at least one job from prior stages fails."
                          ),
                        z
                          .enum(["always"])
                          .describe(
                            "Execute job regardless of the status from prior stages."
                          ),
                        z.enum(["manual"]),
                        z.enum(["delayed"]),
                        z.enum(["never"]).describe("Never execute the job."),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                  start_in: z.string().min(1).optional(),
                  allow_failure: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .boolean()
                          .describe(
                            "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                          ),
                        z
                          .object({ exit_codes: z.number().int() })
                          .strict()
                          .describe(
                            "Exit code that are not considered failure. The job fails for any other exit code."
                          ),
                        z
                          .object({
                            exit_codes: z.array(z.number().int()).min(1),
                          })
                          .strict()
                          .describe(
                            "You can list which exit codes are not considered failures. The job fails for any other exit code."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict(),
              z.string().min(1),
              z.array(z.string()),
            ])
          )
          .optional(),
        variables: z.object({}).catchall(z.any()).optional(),
        cache: z.any().optional(),
        secrets: z
          .record(
            z
              .object({
                vault: z.any().superRefine((x, ctx) => {
                  const schemas = [
                    z
                      .string()
                      .describe(
                        "The secret to be fetched from Vault (e.g. 'production/db/password@ops' translates to secret 'ops/data/production/db', field `password`)"
                      ),
                    z.object({
                      engine: z.object({ name: z.string(), path: z.string() }),
                      path: z.string(),
                      field: z.string(),
                    }),
                  ];
                  const errors = schemas.reduce(
                    (errors: z.ZodError[], schema) =>
                      ((result) =>
                        "error" in result ? [...errors, result.error] : errors)(
                        schema.safeParse(x)
                      ),
                    []
                  );
                  if (schemas.length - errors.length !== 1) {
                    ctx.addIssue({
                      path: ctx.path,
                      code: "invalid_union",
                      unionErrors: errors,
                      message: "Invalid input: Should pass single schema",
                    });
                  }
                }),
              })
              .describe("Environment variable name")
          )
          .optional(),
        script: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.string().min(1),
              z.array(z.union([z.string(), z.array(z.string())])).min(1),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        stage: z
          .union([z.string().min(1), z.array(z.string())])
          .describe("Define what stage the job will run in.")
          .optional(),
        only: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.null(),
              z
                .array(
                  z.union([
                    z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["branches"])
                          .describe("When a branch is pushed."),
                        z.enum(["tags"]).describe("When a tag is pushed."),
                        z
                          .enum(["api"])
                          .describe(
                            "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                          ),
                        z
                          .enum(["external"])
                          .describe("When using CI services other than Gitlab"),
                        z
                          .enum(["pipelines"])
                          .describe(
                            "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                          ),
                        z
                          .enum(["pushes"])
                          .describe(
                            "Pipeline is triggered by a `git push` by the user"
                          ),
                        z
                          .enum(["schedules"])
                          .describe("For scheduled pipelines."),
                        z
                          .enum(["triggers"])
                          .describe(
                            "For pipelines created using a trigger token."
                          ),
                        z
                          .enum(["web"])
                          .describe(
                            "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    }),
                    z
                      .string()
                      .describe(
                        "String or regular expression to match against tag or branch names."
                      ),
                  ])
                )
                .describe(
                  "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                ),
              z
                .object({
                  refs: z
                    .array(
                      z.union([
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .enum(["branches"])
                              .describe("When a branch is pushed."),
                            z.enum(["tags"]).describe("When a tag is pushed."),
                            z
                              .enum(["api"])
                              .describe(
                                "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                              ),
                            z
                              .enum(["external"])
                              .describe(
                                "When using CI services other than Gitlab"
                              ),
                            z
                              .enum(["pipelines"])
                              .describe(
                                "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                              ),
                            z
                              .enum(["pushes"])
                              .describe(
                                "Pipeline is triggered by a `git push` by the user"
                              ),
                            z
                              .enum(["schedules"])
                              .describe("For scheduled pipelines."),
                            z
                              .enum(["triggers"])
                              .describe(
                                "For pipelines created using a trigger token."
                              ),
                            z
                              .enum(["web"])
                              .describe(
                                "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z
                          .string()
                          .describe(
                            "String or regular expression to match against tag or branch names."
                          ),
                      ])
                    )
                    .describe(
                      "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                    )
                    .optional(),
                  kubernetes: z
                    .enum(["active"])
                    .describe(
                      "Filter job based on if Kubernetes integration is active."
                    )
                    .optional(),
                  variables: z.array(z.string()).optional(),
                  changes: z
                    .array(z.string())
                    .describe(
                      "Filter job creation based on files that were modified in a git push."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe("Job will run *only* when these filtering options match.")
          .optional(),
        extends: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [z.string(), z.array(z.string()).min(1)];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "The name of one or more jobs to inherit configuration from."
          )
          .optional(),
        needs: z
          .array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z.string(),
                z
                  .object({
                    job: z.string(),
                    artifacts: z.boolean().optional(),
                    optional: z.boolean().optional(),
                  })
                  .strict(),
                z
                  .object({
                    pipeline: z.string(),
                    job: z.string(),
                    artifacts: z.boolean().optional(),
                  })
                  .strict(),
                z
                  .object({
                    job: z.string(),
                    project: z.string(),
                    ref: z.string(),
                    artifacts: z.boolean().optional(),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          )
          .describe(
            "The list of jobs in previous stages whose sole completion is needed to start the current job."
          )
          .optional(),
        except: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.null(),
              z
                .array(
                  z.union([
                    z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["branches"])
                          .describe("When a branch is pushed."),
                        z.enum(["tags"]).describe("When a tag is pushed."),
                        z
                          .enum(["api"])
                          .describe(
                            "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                          ),
                        z
                          .enum(["external"])
                          .describe("When using CI services other than Gitlab"),
                        z
                          .enum(["pipelines"])
                          .describe(
                            "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                          ),
                        z
                          .enum(["pushes"])
                          .describe(
                            "Pipeline is triggered by a `git push` by the user"
                          ),
                        z
                          .enum(["schedules"])
                          .describe("For scheduled pipelines."),
                        z
                          .enum(["triggers"])
                          .describe(
                            "For pipelines created using a trigger token."
                          ),
                        z
                          .enum(["web"])
                          .describe(
                            "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    }),
                    z
                      .string()
                      .describe(
                        "String or regular expression to match against tag or branch names."
                      ),
                  ])
                )
                .describe(
                  "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                ),
              z
                .object({
                  refs: z
                    .array(
                      z.union([
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .enum(["branches"])
                              .describe("When a branch is pushed."),
                            z.enum(["tags"]).describe("When a tag is pushed."),
                            z
                              .enum(["api"])
                              .describe(
                                "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                              ),
                            z
                              .enum(["external"])
                              .describe(
                                "When using CI services other than Gitlab"
                              ),
                            z
                              .enum(["pipelines"])
                              .describe(
                                "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                              ),
                            z
                              .enum(["pushes"])
                              .describe(
                                "Pipeline is triggered by a `git push` by the user"
                              ),
                            z
                              .enum(["schedules"])
                              .describe("For scheduled pipelines."),
                            z
                              .enum(["triggers"])
                              .describe(
                                "For pipelines created using a trigger token."
                              ),
                            z
                              .enum(["web"])
                              .describe(
                                "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z
                          .string()
                          .describe(
                            "String or regular expression to match against tag or branch names."
                          ),
                      ])
                    )
                    .describe(
                      "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                    )
                    .optional(),
                  kubernetes: z
                    .enum(["active"])
                    .describe(
                      "Filter job based on if Kubernetes integration is active."
                    )
                    .optional(),
                  variables: z.array(z.string()).optional(),
                  changes: z
                    .array(z.string())
                    .describe(
                      "Filter job creation based on files that were modified in a git push."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Job will run *except* for when these filtering options match."
          )
          .optional(),
        tags: z
          .array(z.union([z.string().min(1), z.array(z.string())]))
          .optional(),
        allow_failure: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .boolean()
                .describe(
                  "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                ),
              z
                .object({ exit_codes: z.number().int() })
                .strict()
                .describe(
                  "Exit code that are not considered failure. The job fails for any other exit code."
                ),
              z
                .object({ exit_codes: z.array(z.number().int()).min(1) })
                .strict()
                .describe(
                  "You can list which exit codes are not considered failures. The job fails for any other exit code."
                ),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        timeout: z.string().min(1).optional(),
        when: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .enum(["on_success"])
                .describe(
                  "Execute job only when all jobs from prior stages succeed."
                ),
              z
                .enum(["on_failure"])
                .describe(
                  "Execute job when at least one job from prior stages fails."
                ),
              z
                .enum(["always"])
                .describe(
                  "Execute job regardless of the status from prior stages."
                ),
              z.enum(["manual"]),
              z.enum(["delayed"]),
              z.enum(["never"]).describe("Never execute the job."),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        start_in: z.string().min(1).optional(),
        dependencies: z
          .array(z.string())
          .describe(
            "Specify a list of job names from earlier stages from which artifacts should be loaded. By default, all previous artifacts are passed. Use an empty array to skip downloading artifacts."
          )
          .optional(),
        artifacts: z
          .object({
            paths: z.array(z.string()).min(1).optional(),
            exclude: z.array(z.string()).min(1).optional(),
            expose_as: z.string().optional(),
            name: z.string().optional(),
            untracked: z.boolean().optional(),
            when: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z
                    .enum(["on_success"])
                    .describe(
                      "Upload artifacts only when the job succeeds (this is the default)."
                    ),
                  z
                    .enum(["on_failure"])
                    .describe("Upload artifacts only when the job fails."),
                  z
                    .enum(["always"])
                    .describe("Upload artifacts regardless of job status."),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
            expire_in: z.string().optional(),
            reports: z
              .object({
                junit: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.string().describe("Path to a single XML file"),
                      z
                        .array(z.string())
                        .min(1)
                        .describe(
                          "A list of paths to XML files that will automatically be concatenated into a single file"
                        ),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path for file(s) that should be parsed as JUnit XML result"
                  )
                  .optional(),
                coverage_report: z
                  .object({
                    coverage_format: z
                      .enum(["cobertura"])
                      .describe(
                        "Code coverage format used by the test framework."
                      )
                      .optional(),
                    path: z
                      .string()
                      .min(1)
                      .describe(
                        "Path to the coverage report file that should be parsed."
                      )
                      .optional(),
                  })
                  .describe("Used to collect coverage reports from the job.")
                  .optional(),
                codequality: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with code quality report(s) (such as Code Climate)."
                  )
                  .optional(),
                dotenv: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing runtime-created variables for this job."
                  )
                  .optional(),
                lsif: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing code intelligence (Language Server Index Format)."
                  )
                  .optional(),
                sast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with SAST vulnerabilities report(s)."
                  )
                  .optional(),
                dependency_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Dependency scanning vulnerabilities report(s)."
                  )
                  .optional(),
                container_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Container scanning vulnerabilities report(s)."
                  )
                  .optional(),
                dast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with DAST vulnerabilities report(s)."
                  )
                  .optional(),
                license_management: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Deprecated in 12.8: Path to file or list of files with license report(s)."
                  )
                  .optional(),
                license_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with license report(s)."
                  )
                  .optional(),
                performance: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with performance metrics report(s)."
                  )
                  .optional(),
                requirements: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with requirements report(s)."
                  )
                  .optional(),
                secret_detection: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with secret detection report(s)."
                  )
                  .optional(),
                metrics: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with custom metrics report(s)."
                  )
                  .optional(),
                terraform: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with terraform plan(s)."
                  )
                  .optional(),
                cyclonedx: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
        environment: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.string(),
              z
                .object({
                  name: z
                    .string()
                    .min(1)
                    .describe(
                      "The name of the environment, e.g. 'qa', 'staging', 'production'."
                    ),
                  url: z
                    .string()
                    .regex(new RegExp("^(https?://.+|\\$[A-Za-z]+)"))
                    .url()
                    .describe(
                      "When set, this will expose buttons in various places for the current environment in Gitlab, that will take you to the defined URL."
                    )
                    .optional(),
                  on_stop: z
                    .string()
                    .describe(
                      "The name of a job to execute when the environment is about to be stopped."
                    )
                    .optional(),
                  action: z
                    .enum(["start", "prepare", "stop", "verify", "access"])
                    .describe(
                      "Specifies what this job will do. 'start' (default) indicates the job will start the deployment. 'prepare'/'verify'/'access' indicates this will not affect the deployment. 'stop' indicates this will stop the deployment."
                    )
                    .optional(),
                  auto_stop_in: z
                    .string()
                    .describe(
                      "The amount of time it should take before Gitlab will automatically stop the environment. Supports a wide variety of formats, e.g. '1 week', '3 mins 4 sec', '2 hrs 20 min', '2h20min', '6 mos 1 day', '47 yrs 6 mos and 4d', '3 weeks and 2 days'."
                    )
                    .optional(),
                  kubernetes: z
                    .object({
                      namespace: z
                        .string()
                        .min(1)
                        .describe(
                          "The kubernetes namespace where this environment should be deployed to."
                        )
                        .optional(),
                    })
                    .describe(
                      "Used to configure the kubernetes deployment for this environment. This is currently not supported for kubernetes clusters that are managed by Gitlab."
                    )
                    .optional(),
                  deployment_tier: z
                    .enum([
                      "production",
                      "staging",
                      "testing",
                      "development",
                      "other",
                    ])
                    .describe(
                      "Explicitly specifies the tier of the deployment environment if non-standard environment name is used."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Used to associate environment metadata with a deploy. Environment can have a name and URL attached to it, and will be displayed under /environments under the project."
          )
          .optional(),
        release: z
          .object({
            tag_name: z
              .string()
              .min(1)
              .describe(
                "The tag_name must be specified. It can refer to an existing Git tag or can be specified by the user."
              ),
            tag_message: z
              .string()
              .describe("Message to use if creating a new annotated tag.")
              .optional(),
            description: z
              .string()
              .min(1)
              .describe("Specifies the longer description of the Release."),
            name: z
              .string()
              .describe(
                "The Release name. If omitted, it is populated with the value of release: tag_name."
              )
              .optional(),
            ref: z
              .string()
              .describe(
                "If the release: tag_name doesn’t exist yet, the release is created from ref. ref can be a commit SHA, another tag name, or a branch name."
              )
              .optional(),
            milestones: z
              .array(z.string())
              .describe(
                "The title of each milestone the release is associated with."
              )
              .optional(),
            released_at: z
              .string()
              .regex(
                new RegExp(
                  "^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:Z|[+-][01]\\d:[0-5]\\d)$"
                )
              )
              .describe(
                "The date and time when the release is ready. Defaults to the current date and time if not defined. Should be enclosed in quotes and expressed in ISO 8601 format."
              )
              .optional(),
            assets: z
              .object({
                links: z
                  .array(
                    z
                      .object({
                        name: z
                          .string()
                          .min(1)
                          .describe("The name of the link."),
                        url: z
                          .string()
                          .min(1)
                          .describe("The URL to download a file."),
                        filepath: z
                          .string()
                          .describe("The redirect link to the url.")
                          .optional(),
                        link_type: z
                          .enum(["runbook", "package", "image", "other"])
                          .describe(
                            "The content kind of what users can download via url."
                          )
                          .optional(),
                      })
                      .strict()
                  )
                  .min(1)
                  .describe("Include asset links in the release."),
              })
              .strict()
              .optional(),
          })
          .strict()
          .describe("Indicates that the job creates a Release.")
          .optional(),
        coverage: z
          .string()
          .regex(new RegExp("^/.+/$"))
          .describe(
            "Must be a regular expression, optionally but recommended to be quoted, and must be surrounded with '/'. Example: '/Code coverage: \\d+\\.\\d+/'"
          )
          .optional(),
        retry: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .number()
                .int()
                .gte(0)
                .lte(2)
                .describe(
                  "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                ),
              z
                .object({
                  max: z
                    .number()
                    .int()
                    .gte(0)
                    .lte(2)
                    .describe(
                      "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                    )
                    .optional(),
                  when: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .literal("always")
                              .describe("Retry on any failure (default)."),
                            z
                              .literal("unknown_failure")
                              .describe(
                                "Retry when the failure reason is unknown."
                              ),
                            z
                              .literal("script_failure")
                              .describe("Retry when the script failed."),
                            z
                              .literal("api_failure")
                              .describe("Retry on API failure."),
                            z
                              .literal("stuck_or_timeout_failure")
                              .describe(
                                "Retry when the job got stuck or timed out."
                              ),
                            z
                              .literal("runner_system_failure")
                              .describe(
                                "Retry if there is a runner system failure (for example, job setup failed)."
                              ),
                            z
                              .literal("runner_unsupported")
                              .describe("Retry if the runner is unsupported."),
                            z
                              .literal("stale_schedule")
                              .describe(
                                "Retry if a delayed job could not be executed."
                              ),
                            z
                              .literal("job_execution_timeout")
                              .describe(
                                "Retry if the script exceeded the maximum execution time set for the job."
                              ),
                            z
                              .literal("archived_failure")
                              .describe(
                                "Retry if the job is archived and can’t be run."
                              ),
                            z
                              .literal("unmet_prerequisites")
                              .describe(
                                "Retry if the job failed to complete prerequisite tasks."
                              ),
                            z
                              .literal("scheduler_failure")
                              .describe(
                                "Retry if the scheduler failed to assign the job to a runner."
                              ),
                            z
                              .literal("data_integrity_failure")
                              .describe(
                                "Retry if there is a structural integrity problem detected."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z.array(
                          z.any().superRefine((x, ctx) => {
                            const schemas = [
                              z
                                .literal("always")
                                .describe("Retry on any failure (default)."),
                              z
                                .literal("unknown_failure")
                                .describe(
                                  "Retry when the failure reason is unknown."
                                ),
                              z
                                .literal("script_failure")
                                .describe("Retry when the script failed."),
                              z
                                .literal("api_failure")
                                .describe("Retry on API failure."),
                              z
                                .literal("stuck_or_timeout_failure")
                                .describe(
                                  "Retry when the job got stuck or timed out."
                                ),
                              z
                                .literal("runner_system_failure")
                                .describe(
                                  "Retry if there is a runner system failure (for example, job setup failed)."
                                ),
                              z
                                .literal("runner_unsupported")
                                .describe(
                                  "Retry if the runner is unsupported."
                                ),
                              z
                                .literal("stale_schedule")
                                .describe(
                                  "Retry if a delayed job could not be executed."
                                ),
                              z
                                .literal("job_execution_timeout")
                                .describe(
                                  "Retry if the script exceeded the maximum execution time set for the job."
                                ),
                              z
                                .literal("archived_failure")
                                .describe(
                                  "Retry if the job is archived and can’t be run."
                                ),
                              z
                                .literal("unmet_prerequisites")
                                .describe(
                                  "Retry if the job failed to complete prerequisite tasks."
                                ),
                              z
                                .literal("scheduler_failure")
                                .describe(
                                  "Retry if the scheduler failed to assign the job to a runner."
                                ),
                              z
                                .literal("data_integrity_failure")
                                .describe(
                                  "Retry if there is a structural integrity problem detected."
                                ),
                            ];
                            const errors = schemas.reduce(
                              (errors: z.ZodError[], schema) =>
                                ((result) =>
                                  "error" in result
                                    ? [...errors, result.error]
                                    : errors)(schema.safeParse(x)),
                              []
                            );
                            if (schemas.length - errors.length !== 1) {
                              ctx.addIssue({
                                path: ctx.path,
                                code: "invalid_union",
                                unionErrors: errors,
                                message:
                                  "Invalid input: Should pass single schema",
                              });
                            }
                          })
                        ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        parallel: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .number()
                .int()
                .gte(2)
                .lte(50)
                .describe(
                  "Creates N instances of the same job that run in parallel."
                ),
              z
                .object({
                  matrix: z
                    .array(
                      z
                        .record(
                          z.union([z.string(), z.number(), z.array(z.any())])
                        )
                        .describe(
                          "Defines environment variables for specific job."
                        )
                    )
                    .max(50)
                    .describe(
                      "Defines different variables for jobs that are running in parallel."
                    ),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Parallel will split up a single job into several, and provide `CI_NODE_INDEX` and `CI_NODE_TOTAL` environment variables for the running jobs."
          )
          .optional(),
        interruptible: z.boolean().optional(),
        resource_group: z
          .string()
          .describe(
            "Limit job concurrency. Can be used to ensure that the Runner will not run certain jobs simultaneously."
          )
          .optional(),
        trigger: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .object({
                  project: z
                    .string()
                    .regex(new RegExp("\\S/\\S"))
                    .describe(
                      "Path to the project, e.g. `group/project`, or `group/sub-group/project`."
                    ),
                  branch: z
                    .string()
                    .describe(
                      "The branch name that a downstream pipeline will use"
                    )
                    .optional(),
                  strategy: z
                    .enum(["depend"])
                    .describe(
                      "You can mirror the pipeline status from the triggered pipeline to the source bridge job by using strategy: depend"
                    )
                    .optional(),
                  forward: z
                    .object({
                      yaml_variables: z
                        .boolean()
                        .describe(
                          "Variables defined in the trigger job are passed to downstream pipelines."
                        )
                        .optional(),
                      pipeline_variables: z
                        .boolean()
                        .describe(
                          "Variables added for manual pipeline runs and scheduled pipelines are passed to downstream pipelines."
                        )
                        .optional(),
                    })
                    .strict()
                    .describe(
                      "Specify what to forward to the downstream pipeline."
                    )
                    .optional(),
                })
                .strict(),
              z
                .object({
                  include: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .string()
                          .regex(new RegExp("\\.ya?ml$"))
                          .describe(
                            "Relative path from local repository root (`/`) to the local YAML file to define the pipeline configuration."
                          ),
                        z
                          .array(
                            z.any().superRefine((x, ctx) => {
                              const schemas = [
                                z
                                  .object({
                                    local: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path from local repository root (`/`) to the local YAML file to define the pipeline configuration."
                                      )
                                      .optional(),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    template: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Name of the template YAML file to use in the pipeline configuration."
                                      )
                                      .optional(),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    artifact: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path to the generated YAML file which is extracted from the artifacts and used as the configuration for triggering the child pipeline."
                                      ),
                                    job: z
                                      .string()
                                      .describe(
                                        "Job name which generates the artifact"
                                      ),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    project: z
                                      .string()
                                      .regex(new RegExp("\\S/\\S"))
                                      .describe(
                                        "Path to another private project under the same GitLab instance, like `group/project` or `group/sub-group/project`."
                                      ),
                                    ref: z
                                      .string()
                                      .min(1)
                                      .describe(
                                        "Branch/Tag/Commit hash for the target project."
                                      )
                                      .optional(),
                                    file: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path from repository root (`/`) to the pipeline configuration YAML file."
                                      ),
                                  })
                                  .strict(),
                              ];
                              const errors = schemas.reduce(
                                (errors: z.ZodError[], schema) =>
                                  ((result) =>
                                    "error" in result
                                      ? [...errors, result.error]
                                      : errors)(schema.safeParse(x)),
                                []
                              );
                              if (schemas.length - errors.length !== 1) {
                                ctx.addIssue({
                                  path: ctx.path,
                                  code: "invalid_union",
                                  unionErrors: errors,
                                  message:
                                    "Invalid input: Should pass single schema",
                                });
                              }
                            })
                          )
                          .max(3)
                          .describe(
                            "References a local file or an artifact from another job to define the pipeline configuration."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                  strategy: z
                    .enum(["depend"])
                    .describe(
                      "You can mirror the pipeline status from the triggered pipeline to the source bridge job by using strategy: depend"
                    )
                    .optional(),
                  forward: z
                    .object({
                      yaml_variables: z
                        .boolean()
                        .describe(
                          "Variables defined in the trigger job are passed to downstream pipelines."
                        )
                        .optional(),
                      pipeline_variables: z
                        .boolean()
                        .describe(
                          "Variables added for manual pipeline runs and scheduled pipelines are passed to downstream pipelines."
                        )
                        .optional(),
                    })
                    .strict()
                    .describe(
                      "Specify what to forward to the downstream pipeline."
                    )
                    .optional(),
                })
                .strict()
                .describe(
                  "Trigger a child pipeline. [Learn More](https://docs.gitlab.com/ee/ci/pipelines/parent_child_pipelines.html)."
                ),
              z.string().regex(new RegExp("\\S/\\S")),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        inherit: z
          .object({
            default: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z.boolean(),
                  z.array(
                    z.enum([
                      "after_script",
                      "artifacts",
                      "before_script",
                      "cache",
                      "image",
                      "interruptible",
                      "retry",
                      "services",
                      "tags",
                      "timeout",
                    ])
                  ),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
            variables: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [z.boolean(), z.array(z.string())];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
      .optional(),
    workflow: z
      .object({
        rules: z
          .array(z.union([z.object({}).catchall(z.any()), z.array(z.string())]))
          .optional(),
      })
      .optional(),
  })
  .catchall(
    z
      .object({
        image: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .string()
                .min(1)
                .describe(
                  "Full name of the image that should be used. It should contain the Registry part if needed."
                ),
              z
                .object({
                  name: z
                    .string()
                    .min(1)
                    .describe(
                      "Full name of the image that should be used. It should contain the Registry part if needed."
                    ),
                  entrypoint: z
                    .array(z.any())
                    .min(1)
                    .describe(
                      "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                    )
                    .optional(),
                  pull_policy: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.enum(["always", "never", "if-not-present"]),
                        z
                          .array(z.enum(["always", "never", "if-not-present"]))
                          .min(1),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict()
                .describe(
                  "Specifies the docker image to use for the job or globally for all jobs. Job configuration takes precedence over global setting. Requires a certain kind of Gitlab runner executor."
                ),
              z.array(z.string()),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        services: z
          .array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z
                  .string()
                  .min(1)
                  .describe(
                    "Full name of the image that should be used. It should contain the Registry part if needed."
                  ),
                z
                  .object({
                    name: z
                      .string()
                      .min(1)
                      .describe(
                        "Full name of the image that should be used. It should contain the Registry part if needed."
                      ),
                    entrypoint: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be executed as the container's entrypoint. It will be translated to Docker's --entrypoint option while creating the container. The syntax is similar to Dockerfile's ENTRYPOINT directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    pull_policy: z
                      .any()
                      .superRefine((x, ctx) => {
                        const schemas = [
                          z.enum(["always", "never", "if-not-present"]),
                          z
                            .array(
                              z.enum(["always", "never", "if-not-present"])
                            )
                            .min(1),
                        ];
                        const errors = schemas.reduce(
                          (errors: z.ZodError[], schema) =>
                            ((result) =>
                              "error" in result
                                ? [...errors, result.error]
                                : errors)(schema.safeParse(x)),
                          []
                        );
                        if (schemas.length - errors.length !== 1) {
                          ctx.addIssue({
                            path: ctx.path,
                            code: "invalid_union",
                            unionErrors: errors,
                            message: "Invalid input: Should pass single schema",
                          });
                        }
                      })
                      .optional(),
                    command: z
                      .array(z.string())
                      .min(1)
                      .describe(
                        "Command or script that should be used as the container's command. It will be translated to arguments passed to Docker after the image's name. The syntax is similar to Dockerfile's CMD directive, where each shell token is a separate string in the array."
                      )
                      .optional(),
                    alias: z
                      .string()
                      .min(1)
                      .describe(
                        "Additional alias that can be used to access the service from the job's container. Read Accessing the services for more information."
                      )
                      .optional(),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          )
          .optional(),
        before_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        after_script: z
          .array(z.union([z.string(), z.array(z.string())]))
          .optional(),
        rules: z
          .array(
            z.union([
              z
                .object({
                  if: z.string().optional(),
                  changes: z
                    .union([
                      z
                        .object({
                          paths: z
                            .array(z.string())
                            .describe("List of file paths."),
                          compare_to: z
                            .string()
                            .describe("Ref for comparing changes.")
                            .optional(),
                        })
                        .strict(),
                      z.array(z.string()),
                    ])
                    .optional(),
                  exists: z.array(z.string()).optional(),
                  variables: z.object({}).catchall(z.any()).optional(),
                  when: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["on_success"])
                          .describe(
                            "Execute job only when all jobs from prior stages succeed."
                          ),
                        z
                          .enum(["on_failure"])
                          .describe(
                            "Execute job when at least one job from prior stages fails."
                          ),
                        z
                          .enum(["always"])
                          .describe(
                            "Execute job regardless of the status from prior stages."
                          ),
                        z.enum(["manual"]),
                        z.enum(["delayed"]),
                        z.enum(["never"]).describe("Never execute the job."),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                  start_in: z.string().min(1).optional(),
                  allow_failure: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .boolean()
                          .describe(
                            "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                          ),
                        z
                          .object({ exit_codes: z.number().int() })
                          .strict()
                          .describe(
                            "Exit code that are not considered failure. The job fails for any other exit code."
                          ),
                        z
                          .object({
                            exit_codes: z.array(z.number().int()).min(1),
                          })
                          .strict()
                          .describe(
                            "You can list which exit codes are not considered failures. The job fails for any other exit code."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict(),
              z.string().min(1),
              z.array(z.string()),
            ])
          )
          .optional(),
        variables: z.object({}).catchall(z.any()).optional(),
        cache: z.any().optional(),
        secrets: z
          .record(
            z
              .object({
                vault: z.any().superRefine((x, ctx) => {
                  const schemas = [
                    z
                      .string()
                      .describe(
                        "The secret to be fetched from Vault (e.g. 'production/db/password@ops' translates to secret 'ops/data/production/db', field `password`)"
                      ),
                    z.object({
                      engine: z.object({ name: z.string(), path: z.string() }),
                      path: z.string(),
                      field: z.string(),
                    }),
                  ];
                  const errors = schemas.reduce(
                    (errors: z.ZodError[], schema) =>
                      ((result) =>
                        "error" in result ? [...errors, result.error] : errors)(
                        schema.safeParse(x)
                      ),
                    []
                  );
                  if (schemas.length - errors.length !== 1) {
                    ctx.addIssue({
                      path: ctx.path,
                      code: "invalid_union",
                      unionErrors: errors,
                      message: "Invalid input: Should pass single schema",
                    });
                  }
                }),
              })
              .describe("Environment variable name")
          )
          .optional(),
        script: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.string().min(1),
              z.array(z.union([z.string(), z.array(z.string())])).min(1),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        stage: z
          .union([z.string().min(1), z.array(z.string())])
          .describe("Define what stage the job will run in.")
          .optional(),
        only: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.null(),
              z
                .array(
                  z.union([
                    z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["branches"])
                          .describe("When a branch is pushed."),
                        z.enum(["tags"]).describe("When a tag is pushed."),
                        z
                          .enum(["api"])
                          .describe(
                            "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                          ),
                        z
                          .enum(["external"])
                          .describe("When using CI services other than Gitlab"),
                        z
                          .enum(["pipelines"])
                          .describe(
                            "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                          ),
                        z
                          .enum(["pushes"])
                          .describe(
                            "Pipeline is triggered by a `git push` by the user"
                          ),
                        z
                          .enum(["schedules"])
                          .describe("For scheduled pipelines."),
                        z
                          .enum(["triggers"])
                          .describe(
                            "For pipelines created using a trigger token."
                          ),
                        z
                          .enum(["web"])
                          .describe(
                            "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    }),
                    z
                      .string()
                      .describe(
                        "String or regular expression to match against tag or branch names."
                      ),
                  ])
                )
                .describe(
                  "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                ),
              z
                .object({
                  refs: z
                    .array(
                      z.union([
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .enum(["branches"])
                              .describe("When a branch is pushed."),
                            z.enum(["tags"]).describe("When a tag is pushed."),
                            z
                              .enum(["api"])
                              .describe(
                                "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                              ),
                            z
                              .enum(["external"])
                              .describe(
                                "When using CI services other than Gitlab"
                              ),
                            z
                              .enum(["pipelines"])
                              .describe(
                                "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                              ),
                            z
                              .enum(["pushes"])
                              .describe(
                                "Pipeline is triggered by a `git push` by the user"
                              ),
                            z
                              .enum(["schedules"])
                              .describe("For scheduled pipelines."),
                            z
                              .enum(["triggers"])
                              .describe(
                                "For pipelines created using a trigger token."
                              ),
                            z
                              .enum(["web"])
                              .describe(
                                "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z
                          .string()
                          .describe(
                            "String or regular expression to match against tag or branch names."
                          ),
                      ])
                    )
                    .describe(
                      "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                    )
                    .optional(),
                  kubernetes: z
                    .enum(["active"])
                    .describe(
                      "Filter job based on if Kubernetes integration is active."
                    )
                    .optional(),
                  variables: z.array(z.string()).optional(),
                  changes: z
                    .array(z.string())
                    .describe(
                      "Filter job creation based on files that were modified in a git push."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe("Job will run *only* when these filtering options match.")
          .optional(),
        extends: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [z.string(), z.array(z.string()).min(1)];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "The name of one or more jobs to inherit configuration from."
          )
          .optional(),
        needs: z
          .array(
            z.any().superRefine((x, ctx) => {
              const schemas = [
                z.string(),
                z
                  .object({
                    job: z.string(),
                    artifacts: z.boolean().optional(),
                    optional: z.boolean().optional(),
                  })
                  .strict(),
                z
                  .object({
                    pipeline: z.string(),
                    job: z.string(),
                    artifacts: z.boolean().optional(),
                  })
                  .strict(),
                z
                  .object({
                    job: z.string(),
                    project: z.string(),
                    ref: z.string(),
                    artifacts: z.boolean().optional(),
                  })
                  .strict(),
              ];
              const errors = schemas.reduce(
                (errors: z.ZodError[], schema) =>
                  ((result) =>
                    "error" in result ? [...errors, result.error] : errors)(
                    schema.safeParse(x)
                  ),
                []
              );
              if (schemas.length - errors.length !== 1) {
                ctx.addIssue({
                  path: ctx.path,
                  code: "invalid_union",
                  unionErrors: errors,
                  message: "Invalid input: Should pass single schema",
                });
              }
            })
          )
          .describe(
            "The list of jobs in previous stages whose sole completion is needed to start the current job."
          )
          .optional(),
        except: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.null(),
              z
                .array(
                  z.union([
                    z.any().superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .enum(["branches"])
                          .describe("When a branch is pushed."),
                        z.enum(["tags"]).describe("When a tag is pushed."),
                        z
                          .enum(["api"])
                          .describe(
                            "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                          ),
                        z
                          .enum(["external"])
                          .describe("When using CI services other than Gitlab"),
                        z
                          .enum(["pipelines"])
                          .describe(
                            "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                          ),
                        z
                          .enum(["pushes"])
                          .describe(
                            "Pipeline is triggered by a `git push` by the user"
                          ),
                        z
                          .enum(["schedules"])
                          .describe("For scheduled pipelines."),
                        z
                          .enum(["triggers"])
                          .describe(
                            "For pipelines created using a trigger token."
                          ),
                        z
                          .enum(["web"])
                          .describe(
                            "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    }),
                    z
                      .string()
                      .describe(
                        "String or regular expression to match against tag or branch names."
                      ),
                  ])
                )
                .describe(
                  "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                ),
              z
                .object({
                  refs: z
                    .array(
                      z.union([
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .enum(["branches"])
                              .describe("When a branch is pushed."),
                            z.enum(["tags"]).describe("When a tag is pushed."),
                            z
                              .enum(["api"])
                              .describe(
                                "When a pipeline has been triggered by a second pipelines API (not triggers API)."
                              ),
                            z
                              .enum(["external"])
                              .describe(
                                "When using CI services other than Gitlab"
                              ),
                            z
                              .enum(["pipelines"])
                              .describe(
                                "For multi-project triggers, created using the API with 'CI_JOB_TOKEN'."
                              ),
                            z
                              .enum(["pushes"])
                              .describe(
                                "Pipeline is triggered by a `git push` by the user"
                              ),
                            z
                              .enum(["schedules"])
                              .describe("For scheduled pipelines."),
                            z
                              .enum(["triggers"])
                              .describe(
                                "For pipelines created using a trigger token."
                              ),
                            z
                              .enum(["web"])
                              .describe(
                                "For pipelines created using *Run pipeline* button in Gitlab UI (under your project's *Pipelines*)."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z
                          .string()
                          .describe(
                            "String or regular expression to match against tag or branch names."
                          ),
                      ])
                    )
                    .describe(
                      "Filter job by different keywords that determine origin or state, or by supplying string/regex to check against branch/tag names."
                    )
                    .optional(),
                  kubernetes: z
                    .enum(["active"])
                    .describe(
                      "Filter job based on if Kubernetes integration is active."
                    )
                    .optional(),
                  variables: z.array(z.string()).optional(),
                  changes: z
                    .array(z.string())
                    .describe(
                      "Filter job creation based on files that were modified in a git push."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Job will run *except* for when these filtering options match."
          )
          .optional(),
        tags: z
          .array(z.union([z.string().min(1), z.array(z.string())]))
          .optional(),
        allow_failure: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .boolean()
                .describe(
                  "Setting this option to true will allow the job to fail while still letting the pipeline pass."
                ),
              z
                .object({ exit_codes: z.number().int() })
                .strict()
                .describe(
                  "Exit code that are not considered failure. The job fails for any other exit code."
                ),
              z
                .object({ exit_codes: z.array(z.number().int()).min(1) })
                .strict()
                .describe(
                  "You can list which exit codes are not considered failures. The job fails for any other exit code."
                ),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        timeout: z.string().min(1).optional(),
        when: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .enum(["on_success"])
                .describe(
                  "Execute job only when all jobs from prior stages succeed."
                ),
              z
                .enum(["on_failure"])
                .describe(
                  "Execute job when at least one job from prior stages fails."
                ),
              z
                .enum(["always"])
                .describe(
                  "Execute job regardless of the status from prior stages."
                ),
              z.enum(["manual"]),
              z.enum(["delayed"]),
              z.enum(["never"]).describe("Never execute the job."),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        start_in: z.string().min(1).optional(),
        dependencies: z
          .array(z.string())
          .describe(
            "Specify a list of job names from earlier stages from which artifacts should be loaded. By default, all previous artifacts are passed. Use an empty array to skip downloading artifacts."
          )
          .optional(),
        artifacts: z
          .object({
            paths: z.array(z.string()).min(1).optional(),
            exclude: z.array(z.string()).min(1).optional(),
            expose_as: z.string().optional(),
            name: z.string().optional(),
            untracked: z.boolean().optional(),
            when: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z
                    .enum(["on_success"])
                    .describe(
                      "Upload artifacts only when the job succeeds (this is the default)."
                    ),
                  z
                    .enum(["on_failure"])
                    .describe("Upload artifacts only when the job fails."),
                  z
                    .enum(["always"])
                    .describe("Upload artifacts regardless of job status."),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
            expire_in: z.string().optional(),
            reports: z
              .object({
                junit: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [
                      z.string().describe("Path to a single XML file"),
                      z
                        .array(z.string())
                        .min(1)
                        .describe(
                          "A list of paths to XML files that will automatically be concatenated into a single file"
                        ),
                    ];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path for file(s) that should be parsed as JUnit XML result"
                  )
                  .optional(),
                coverage_report: z
                  .object({
                    coverage_format: z
                      .enum(["cobertura"])
                      .describe(
                        "Code coverage format used by the test framework."
                      )
                      .optional(),
                    path: z
                      .string()
                      .min(1)
                      .describe(
                        "Path to the coverage report file that should be parsed."
                      )
                      .optional(),
                  })
                  .describe("Used to collect coverage reports from the job.")
                  .optional(),
                codequality: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with code quality report(s) (such as Code Climate)."
                  )
                  .optional(),
                dotenv: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing runtime-created variables for this job."
                  )
                  .optional(),
                lsif: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files containing code intelligence (Language Server Index Format)."
                  )
                  .optional(),
                sast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with SAST vulnerabilities report(s)."
                  )
                  .optional(),
                dependency_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Dependency scanning vulnerabilities report(s)."
                  )
                  .optional(),
                container_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with Container scanning vulnerabilities report(s)."
                  )
                  .optional(),
                dast: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with DAST vulnerabilities report(s)."
                  )
                  .optional(),
                license_management: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Deprecated in 12.8: Path to file or list of files with license report(s)."
                  )
                  .optional(),
                license_scanning: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with license report(s)."
                  )
                  .optional(),
                performance: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with performance metrics report(s)."
                  )
                  .optional(),
                requirements: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with requirements report(s)."
                  )
                  .optional(),
                secret_detection: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with secret detection report(s)."
                  )
                  .optional(),
                metrics: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with custom metrics report(s)."
                  )
                  .optional(),
                terraform: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .describe(
                    "Path to file or list of files with terraform plan(s)."
                  )
                  .optional(),
                cyclonedx: z
                  .any()
                  .superRefine((x, ctx) => {
                    const schemas = [z.string(), z.array(z.string())];
                    const errors = schemas.reduce(
                      (errors: z.ZodError[], schema) =>
                        ((result) =>
                          "error" in result
                            ? [...errors, result.error]
                            : errors)(schema.safeParse(x)),
                      []
                    );
                    if (schemas.length - errors.length !== 1) {
                      ctx.addIssue({
                        path: ctx.path,
                        code: "invalid_union",
                        unionErrors: errors,
                        message: "Invalid input: Should pass single schema",
                      });
                    }
                  })
                  .optional(),
              })
              .strict()
              .optional(),
          })
          .strict()
          .optional(),
        environment: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z.string(),
              z
                .object({
                  name: z
                    .string()
                    .min(1)
                    .describe(
                      "The name of the environment, e.g. 'qa', 'staging', 'production'."
                    ),
                  url: z
                    .string()
                    .regex(new RegExp("^(https?://.+|\\$[A-Za-z]+)"))
                    .url()
                    .describe(
                      "When set, this will expose buttons in various places for the current environment in Gitlab, that will take you to the defined URL."
                    )
                    .optional(),
                  on_stop: z
                    .string()
                    .describe(
                      "The name of a job to execute when the environment is about to be stopped."
                    )
                    .optional(),
                  action: z
                    .enum(["start", "prepare", "stop", "verify", "access"])
                    .describe(
                      "Specifies what this job will do. 'start' (default) indicates the job will start the deployment. 'prepare'/'verify'/'access' indicates this will not affect the deployment. 'stop' indicates this will stop the deployment."
                    )
                    .optional(),
                  auto_stop_in: z
                    .string()
                    .describe(
                      "The amount of time it should take before Gitlab will automatically stop the environment. Supports a wide variety of formats, e.g. '1 week', '3 mins 4 sec', '2 hrs 20 min', '2h20min', '6 mos 1 day', '47 yrs 6 mos and 4d', '3 weeks and 2 days'."
                    )
                    .optional(),
                  kubernetes: z
                    .object({
                      namespace: z
                        .string()
                        .min(1)
                        .describe(
                          "The kubernetes namespace where this environment should be deployed to."
                        )
                        .optional(),
                    })
                    .describe(
                      "Used to configure the kubernetes deployment for this environment. This is currently not supported for kubernetes clusters that are managed by Gitlab."
                    )
                    .optional(),
                  deployment_tier: z
                    .enum([
                      "production",
                      "staging",
                      "testing",
                      "development",
                      "other",
                    ])
                    .describe(
                      "Explicitly specifies the tier of the deployment environment if non-standard environment name is used."
                    )
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Used to associate environment metadata with a deploy. Environment can have a name and URL attached to it, and will be displayed under /environments under the project."
          )
          .optional(),
        release: z
          .object({
            tag_name: z
              .string()
              .min(1)
              .describe(
                "The tag_name must be specified. It can refer to an existing Git tag or can be specified by the user."
              ),
            tag_message: z
              .string()
              .describe("Message to use if creating a new annotated tag.")
              .optional(),
            description: z
              .string()
              .min(1)
              .describe("Specifies the longer description of the Release."),
            name: z
              .string()
              .describe(
                "The Release name. If omitted, it is populated with the value of release: tag_name."
              )
              .optional(),
            ref: z
              .string()
              .describe(
                "If the release: tag_name doesn’t exist yet, the release is created from ref. ref can be a commit SHA, another tag name, or a branch name."
              )
              .optional(),
            milestones: z
              .array(z.string())
              .describe(
                "The title of each milestone the release is associated with."
              )
              .optional(),
            released_at: z
              .string()
              .regex(
                new RegExp(
                  "^(?:[1-9]\\d{3}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1\\d|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[1-9]\\d(?:0[48]|[2468][048]|[13579][26])|(?:[2468][048]|[13579][26])00)-02-29)T(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d(?:Z|[+-][01]\\d:[0-5]\\d)$"
                )
              )
              .describe(
                "The date and time when the release is ready. Defaults to the current date and time if not defined. Should be enclosed in quotes and expressed in ISO 8601 format."
              )
              .optional(),
            assets: z
              .object({
                links: z
                  .array(
                    z
                      .object({
                        name: z
                          .string()
                          .min(1)
                          .describe("The name of the link."),
                        url: z
                          .string()
                          .min(1)
                          .describe("The URL to download a file."),
                        filepath: z
                          .string()
                          .describe("The redirect link to the url.")
                          .optional(),
                        link_type: z
                          .enum(["runbook", "package", "image", "other"])
                          .describe(
                            "The content kind of what users can download via url."
                          )
                          .optional(),
                      })
                      .strict()
                  )
                  .min(1)
                  .describe("Include asset links in the release."),
              })
              .strict()
              .optional(),
          })
          .strict()
          .describe("Indicates that the job creates a Release.")
          .optional(),
        coverage: z
          .string()
          .regex(new RegExp("^/.+/$"))
          .describe(
            "Must be a regular expression, optionally but recommended to be quoted, and must be surrounded with '/'. Example: '/Code coverage: \\d+\\.\\d+/'"
          )
          .optional(),
        retry: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .number()
                .int()
                .gte(0)
                .lte(2)
                .describe(
                  "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                ),
              z
                .object({
                  max: z
                    .number()
                    .int()
                    .gte(0)
                    .lte(2)
                    .describe(
                      "The number of times the job will be retried if it fails. Defaults to 0 and can max be retried 2 times (3 times total)."
                    )
                    .optional(),
                  when: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z.any().superRefine((x, ctx) => {
                          const schemas = [
                            z
                              .literal("always")
                              .describe("Retry on any failure (default)."),
                            z
                              .literal("unknown_failure")
                              .describe(
                                "Retry when the failure reason is unknown."
                              ),
                            z
                              .literal("script_failure")
                              .describe("Retry when the script failed."),
                            z
                              .literal("api_failure")
                              .describe("Retry on API failure."),
                            z
                              .literal("stuck_or_timeout_failure")
                              .describe(
                                "Retry when the job got stuck or timed out."
                              ),
                            z
                              .literal("runner_system_failure")
                              .describe(
                                "Retry if there is a runner system failure (for example, job setup failed)."
                              ),
                            z
                              .literal("runner_unsupported")
                              .describe("Retry if the runner is unsupported."),
                            z
                              .literal("stale_schedule")
                              .describe(
                                "Retry if a delayed job could not be executed."
                              ),
                            z
                              .literal("job_execution_timeout")
                              .describe(
                                "Retry if the script exceeded the maximum execution time set for the job."
                              ),
                            z
                              .literal("archived_failure")
                              .describe(
                                "Retry if the job is archived and can’t be run."
                              ),
                            z
                              .literal("unmet_prerequisites")
                              .describe(
                                "Retry if the job failed to complete prerequisite tasks."
                              ),
                            z
                              .literal("scheduler_failure")
                              .describe(
                                "Retry if the scheduler failed to assign the job to a runner."
                              ),
                            z
                              .literal("data_integrity_failure")
                              .describe(
                                "Retry if there is a structural integrity problem detected."
                              ),
                          ];
                          const errors = schemas.reduce(
                            (errors: z.ZodError[], schema) =>
                              ((result) =>
                                "error" in result
                                  ? [...errors, result.error]
                                  : errors)(schema.safeParse(x)),
                            []
                          );
                          if (schemas.length - errors.length !== 1) {
                            ctx.addIssue({
                              path: ctx.path,
                              code: "invalid_union",
                              unionErrors: errors,
                              message:
                                "Invalid input: Should pass single schema",
                            });
                          }
                        }),
                        z.array(
                          z.any().superRefine((x, ctx) => {
                            const schemas = [
                              z
                                .literal("always")
                                .describe("Retry on any failure (default)."),
                              z
                                .literal("unknown_failure")
                                .describe(
                                  "Retry when the failure reason is unknown."
                                ),
                              z
                                .literal("script_failure")
                                .describe("Retry when the script failed."),
                              z
                                .literal("api_failure")
                                .describe("Retry on API failure."),
                              z
                                .literal("stuck_or_timeout_failure")
                                .describe(
                                  "Retry when the job got stuck or timed out."
                                ),
                              z
                                .literal("runner_system_failure")
                                .describe(
                                  "Retry if there is a runner system failure (for example, job setup failed)."
                                ),
                              z
                                .literal("runner_unsupported")
                                .describe(
                                  "Retry if the runner is unsupported."
                                ),
                              z
                                .literal("stale_schedule")
                                .describe(
                                  "Retry if a delayed job could not be executed."
                                ),
                              z
                                .literal("job_execution_timeout")
                                .describe(
                                  "Retry if the script exceeded the maximum execution time set for the job."
                                ),
                              z
                                .literal("archived_failure")
                                .describe(
                                  "Retry if the job is archived and can’t be run."
                                ),
                              z
                                .literal("unmet_prerequisites")
                                .describe(
                                  "Retry if the job failed to complete prerequisite tasks."
                                ),
                              z
                                .literal("scheduler_failure")
                                .describe(
                                  "Retry if the scheduler failed to assign the job to a runner."
                                ),
                              z
                                .literal("data_integrity_failure")
                                .describe(
                                  "Retry if there is a structural integrity problem detected."
                                ),
                            ];
                            const errors = schemas.reduce(
                              (errors: z.ZodError[], schema) =>
                                ((result) =>
                                  "error" in result
                                    ? [...errors, result.error]
                                    : errors)(schema.safeParse(x)),
                              []
                            );
                            if (schemas.length - errors.length !== 1) {
                              ctx.addIssue({
                                path: ctx.path,
                                code: "invalid_union",
                                unionErrors: errors,
                                message:
                                  "Invalid input: Should pass single schema",
                              });
                            }
                          })
                        ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        parallel: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .number()
                .int()
                .gte(2)
                .lte(50)
                .describe(
                  "Creates N instances of the same job that run in parallel."
                ),
              z
                .object({
                  matrix: z
                    .array(
                      z
                        .record(
                          z.union([z.string(), z.number(), z.array(z.any())])
                        )
                        .describe(
                          "Defines environment variables for specific job."
                        )
                    )
                    .max(50)
                    .describe(
                      "Defines different variables for jobs that are running in parallel."
                    ),
                })
                .strict(),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .describe(
            "Parallel will split up a single job into several, and provide `CI_NODE_INDEX` and `CI_NODE_TOTAL` environment variables for the running jobs."
          )
          .optional(),
        interruptible: z.boolean().optional(),
        resource_group: z
          .string()
          .describe(
            "Limit job concurrency. Can be used to ensure that the Runner will not run certain jobs simultaneously."
          )
          .optional(),
        trigger: z
          .any()
          .superRefine((x, ctx) => {
            const schemas = [
              z
                .object({
                  project: z
                    .string()
                    .regex(new RegExp("\\S/\\S"))
                    .describe(
                      "Path to the project, e.g. `group/project`, or `group/sub-group/project`."
                    ),
                  branch: z
                    .string()
                    .describe(
                      "The branch name that a downstream pipeline will use"
                    )
                    .optional(),
                  strategy: z
                    .enum(["depend"])
                    .describe(
                      "You can mirror the pipeline status from the triggered pipeline to the source bridge job by using strategy: depend"
                    )
                    .optional(),
                  forward: z
                    .object({
                      yaml_variables: z
                        .boolean()
                        .describe(
                          "Variables defined in the trigger job are passed to downstream pipelines."
                        )
                        .optional(),
                      pipeline_variables: z
                        .boolean()
                        .describe(
                          "Variables added for manual pipeline runs and scheduled pipelines are passed to downstream pipelines."
                        )
                        .optional(),
                    })
                    .strict()
                    .describe(
                      "Specify what to forward to the downstream pipeline."
                    )
                    .optional(),
                })
                .strict(),
              z
                .object({
                  include: z
                    .any()
                    .superRefine((x, ctx) => {
                      const schemas = [
                        z
                          .string()
                          .regex(new RegExp("\\.ya?ml$"))
                          .describe(
                            "Relative path from local repository root (`/`) to the local YAML file to define the pipeline configuration."
                          ),
                        z
                          .array(
                            z.any().superRefine((x, ctx) => {
                              const schemas = [
                                z
                                  .object({
                                    local: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path from local repository root (`/`) to the local YAML file to define the pipeline configuration."
                                      )
                                      .optional(),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    template: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Name of the template YAML file to use in the pipeline configuration."
                                      )
                                      .optional(),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    artifact: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path to the generated YAML file which is extracted from the artifacts and used as the configuration for triggering the child pipeline."
                                      ),
                                    job: z
                                      .string()
                                      .describe(
                                        "Job name which generates the artifact"
                                      ),
                                  })
                                  .strict(),
                                z
                                  .object({
                                    project: z
                                      .string()
                                      .regex(new RegExp("\\S/\\S"))
                                      .describe(
                                        "Path to another private project under the same GitLab instance, like `group/project` or `group/sub-group/project`."
                                      ),
                                    ref: z
                                      .string()
                                      .min(1)
                                      .describe(
                                        "Branch/Tag/Commit hash for the target project."
                                      )
                                      .optional(),
                                    file: z
                                      .string()
                                      .regex(new RegExp("\\.ya?ml$"))
                                      .describe(
                                        "Relative path from repository root (`/`) to the pipeline configuration YAML file."
                                      ),
                                  })
                                  .strict(),
                              ];
                              const errors = schemas.reduce(
                                (errors: z.ZodError[], schema) =>
                                  ((result) =>
                                    "error" in result
                                      ? [...errors, result.error]
                                      : errors)(schema.safeParse(x)),
                                []
                              );
                              if (schemas.length - errors.length !== 1) {
                                ctx.addIssue({
                                  path: ctx.path,
                                  code: "invalid_union",
                                  unionErrors: errors,
                                  message:
                                    "Invalid input: Should pass single schema",
                                });
                              }
                            })
                          )
                          .max(3)
                          .describe(
                            "References a local file or an artifact from another job to define the pipeline configuration."
                          ),
                      ];
                      const errors = schemas.reduce(
                        (errors: z.ZodError[], schema) =>
                          ((result) =>
                            "error" in result
                              ? [...errors, result.error]
                              : errors)(schema.safeParse(x)),
                        []
                      );
                      if (schemas.length - errors.length !== 1) {
                        ctx.addIssue({
                          path: ctx.path,
                          code: "invalid_union",
                          unionErrors: errors,
                          message: "Invalid input: Should pass single schema",
                        });
                      }
                    })
                    .optional(),
                  strategy: z
                    .enum(["depend"])
                    .describe(
                      "You can mirror the pipeline status from the triggered pipeline to the source bridge job by using strategy: depend"
                    )
                    .optional(),
                  forward: z
                    .object({
                      yaml_variables: z
                        .boolean()
                        .describe(
                          "Variables defined in the trigger job are passed to downstream pipelines."
                        )
                        .optional(),
                      pipeline_variables: z
                        .boolean()
                        .describe(
                          "Variables added for manual pipeline runs and scheduled pipelines are passed to downstream pipelines."
                        )
                        .optional(),
                    })
                    .strict()
                    .describe(
                      "Specify what to forward to the downstream pipeline."
                    )
                    .optional(),
                })
                .strict()
                .describe(
                  "Trigger a child pipeline. [Learn More](https://docs.gitlab.com/ee/ci/pipelines/parent_child_pipelines.html)."
                ),
              z.string().regex(new RegExp("\\S/\\S")),
            ];
            const errors = schemas.reduce(
              (errors: z.ZodError[], schema) =>
                ((result) =>
                  "error" in result ? [...errors, result.error] : errors)(
                  schema.safeParse(x)
                ),
              []
            );
            if (schemas.length - errors.length !== 1) {
              ctx.addIssue({
                path: ctx.path,
                code: "invalid_union",
                unionErrors: errors,
                message: "Invalid input: Should pass single schema",
              });
            }
          })
          .optional(),
        inherit: z
          .object({
            default: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [
                  z.boolean(),
                  z.array(
                    z.enum([
                      "after_script",
                      "artifacts",
                      "before_script",
                      "cache",
                      "image",
                      "interruptible",
                      "retry",
                      "services",
                      "tags",
                      "timeout",
                    ])
                  ),
                ];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
            variables: z
              .any()
              .superRefine((x, ctx) => {
                const schemas = [z.boolean(), z.array(z.string())];
                const errors = schemas.reduce(
                  (errors: z.ZodError[], schema) =>
                    ((result) =>
                      "error" in result ? [...errors, result.error] : errors)(
                      schema.safeParse(x)
                    ),
                  []
                );
                if (schemas.length - errors.length !== 1) {
                  ctx.addIssue({
                    path: ctx.path,
                    code: "invalid_union",
                    unionErrors: errors,
                    message: "Invalid input: Should pass single schema",
                  });
                }
              })
              .optional(),
          })
          .strict()
          .optional(),
      })
      .strict()
  );
