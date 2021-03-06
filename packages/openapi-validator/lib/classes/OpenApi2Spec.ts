import {
  getPathnameWithoutBasePath,
  findOpenApiPathMatchingPossiblePathnames,
} from '../utils/common.utils';
import AbstractOpenApiSpec from './AbstractOpenApiSpec';
import ValidationError from './errors/ValidationError';

const basePathPropertyNotProvided = (spec) =>
  !Object.prototype.hasOwnProperty.call(spec, 'basePath');

export default class OpenApi2Spec extends AbstractOpenApiSpec {
  public didUserDefineBasePath: boolean;

  constructor(spec) {
    super(spec);
    this.didUserDefineBasePath = !basePathPropertyNotProvided(spec);
  }

  /**
   * "If the basePath property is not provided, the API is served directly under the host
   * @see https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#fixed-fields
   */
  findOpenApiPathMatchingPathname(pathname) {
    const { basePath } = this.spec;
    if (basePath && !pathname.startsWith(basePath)) {
      throw new ValidationError('BASE_PATH_NOT_FOUND');
    }
    const pathnameWithoutBasePath = getPathnameWithoutBasePath(
      basePath,
      pathname,
    );
    const openApiPath = findOpenApiPathMatchingPossiblePathnames(
      [pathnameWithoutBasePath],
      this.paths(),
    );
    if (!openApiPath) {
      throw new ValidationError('PATH_NOT_FOUND');
    }
    return openApiPath;
  }

  /**
   * @returns {ResponseObject} ResponseObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#responses-definitions-object}
   */
  findResponseDefinition(referenceString) {
    const nameOfResponseDefinition = referenceString.split('#/responses/')[1];
    return this.spec.responses[nameOfResponseDefinition];
  }

  /**
   * @returns {[DefinitionsObject]} DefinitionsObject
   * {@link https://github.com/OAI/OpenAPI-Specification/blob/master/versions/2.0.md#definitions-object}
   */
  getComponentDefinitions() {
    return this.spec.definitions;
  }

  getComponentDefinitionsProperty() {
    return { definitions: this.getComponentDefinitions() };
  }

  getSchemaObjects() {
    return this.getComponentDefinitions();
  }
}
