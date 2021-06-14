import path from 'path';

import jestOpenAPI from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/preferLeastTemplatedPathOverMostTemplatedPath',
);

describe('expect(res).toSatisfyApiSpec() (using an OpenAPI spec with similar templated and non-templated OpenAPI paths)', () => {
  [2, 3].forEach((openApiVersion) => {
    describe(`OpenAPI ${openApiVersion}`, () => {
      const openApiSpecs = [
        {
          isLeastTemplatedPathFirst: true,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'leastTemplatedPathBeforeMostTemplatedPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
        {
          isLeastTemplatedPathFirst: false,
          pathToApiSpec: path.join(
            openApiSpecsDir,
            'leastTemplatedPathAfterMostTemplatedPath',
            `openapi${openApiVersion}.yml`,
          ),
        },
      ];

      openApiSpecs.forEach((spec) => {
        const { pathToApiSpec, isLeastTemplatedPathFirst } = spec;

        describe(`res.req.path matches a non-templated OpenAPI path ${
          isLeastTemplatedPathFirst ? 'before' : 'after'
        } a templated OpenAPI path`, () => {
          const res = {
            status: 200,
            req: {
              method: 'GET',
              path:
                '/preferLeastTemplatedPathOverMostTemplatedPath/templatedPath/nonTemplatedPath',
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
              "not to satisfy the '200' response defined for endpoint 'GET /preferLeastTemplatedPathOverMostTemplatedPath/{templatedPath}/nonTemplatedPath'",
            );
          });
        });
      });
    });
  });
});
