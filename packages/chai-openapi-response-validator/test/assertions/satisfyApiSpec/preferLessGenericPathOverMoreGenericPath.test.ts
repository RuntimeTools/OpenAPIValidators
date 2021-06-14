import chai from 'chai';
import path from 'path';

import chaiResponseValidator from '../../..';

const openApiSpecsDir = path.resolve(
  '../../commonTestResources/exampleOpenApiFiles/valid/preferLessGenericPathOverMoreGenericPath',
);
const { expect } = chai;

describe('expect(res).to.satisfyApiSpec (using an OpenAPI spec with similar less generic paths and more generic OpenAPI paths)', () => {
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

        describe(`res.req.path matches a least-templated OpenAPI path ${
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

          before(() => {
            chai.use(chaiResponseValidator(pathToApiSpec));
          });

          it('passes', () => {
            expect(res).to.satisfyApiSpec;
          });

          it('fails when using .not', () => {
            const assertion = () => expect(res).to.not.satisfyApiSpec;
            expect(assertion).to.throw(
              "not to satisfy the '200' response defined for endpoint 'GET /preferLessGenericPathOverMoreGenericPath/{templatedPath}/nonTemplatedPath'",
            );
          });
        });
      });
    });
  });
});
