import chai from 'chai';
import path from 'path';

import chaiResponseValidator from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/preferLeastTemplatedPathOverMostTemplatedPath',
);
const { expect } = chai;

describe('expect(res).to.satisfyApiSpec (using an OpenAPI spec with similar least-templated and most-templated OpenAPI paths)', () => {
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

        describe(`res.req.path matches a least-templated OpenAPI path ${
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

          before(() => {
            chai.use(chaiResponseValidator(pathToApiSpec));
          });

          it('passes', () => {
            expect(res).to.satisfyApiSpec;
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(
              "not to satisfy the '200' response defined for endpoint 'GET /preferLeastTemplatedPathOverMostTemplatedPath/{templatedPath}/nonTemplatedPath'",
            );
          });
        });
      });
    });
  });
});
