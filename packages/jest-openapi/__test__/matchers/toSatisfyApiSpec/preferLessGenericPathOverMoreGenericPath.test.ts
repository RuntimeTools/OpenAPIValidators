import path from 'path';

import jestOpenAPI from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/preferLessGenericPathOverMoreGenericPath',
);

describe('expect(res).toSatisfyApiSpec() (using an OpenAPI spec with similar less generic paths and more generic OpenAPI paths)', () => {
  [2, 3].forEach((openApiVersion) => {
    describe(`OpenAPI ${openApiVersion}`, () => {
      const openApiSpecs = [
        {
          isLessGenericPathFirst: true,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'lessGenericPathBeforeMoreGenericPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
        {
          isLessGenericPathFirst: false,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'lessGenericPathAfterMoreGenericPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
      ];

      openApiSpecs.forEach((spec) => {
        const { pathToApiSpec, isLessGenericPathFirst } = spec;

        describe(`res.req.path matches a non-templated OpenAPI path ${
          isLessGenericPathFirst ? 'before' : 'after'
        } a templated OpenAPI path`, () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path:
                '/preferLessGenericPathOverMoreGenericPath/templatedPath/nonTemplatedPath',
            },
            body: 'valid body (string)',
          };

          beforeAll(() => {
            jestOpenAPI(pathToApiSpec);
          });

          it('passes', () => {
            expect(res).toSatisfyApiSpec();
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).not.toSatisfyApiSpec();
            expect(assertion).toThrow(
              "not to satisfy the '200' response defined for endpoint 'GET /preferLessGenericPathOverMoreGenericPath/{templatedPath}/nonTemplatedPath'",
            );
          });
        });
      });
    });
  });
});
