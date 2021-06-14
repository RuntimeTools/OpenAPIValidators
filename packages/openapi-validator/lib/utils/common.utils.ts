import { inspect } from 'util';
import { Path } from 'path-parser';
import url from 'url';

export const stringify = (obj) => inspect(obj, { depth: null });

// excludes the query because path = pathname + query
export const getPathname = (request) => url.parse(request.path).pathname;

// converts all {foo} to :foo
const convertOpenApiPathToColonForm = (openApiPath) =>
  openApiPath.replace(/{/g, ':').replace(/}/g, '');

const doesColonPathMatchPathname = (pathInColonForm, pathname) => {
  const pathParamsInPathname = new Path(pathInColonForm).test(pathname); // => one of: null, {}, {exampleParam: 'foo'}
  return Boolean(pathParamsInPathname);
};

const doesOpenApiPathMatchPathname = (openApiPath, pathname) => {
  const pathInColonForm = convertOpenApiPathToColonForm(openApiPath);
  return doesColonPathMatchPathname(pathInColonForm, pathname);
};

const compareOpenApiPathsByGenericity = (openApiPath1, openApiPath2) => {
  // genericity is a based on the idea that a path with a template parameters is more generic
  // than a path without any template parameter
  // simple examples:
  //  "/a" == "/b"
  //  "/{foo}" == "/{bar}"
  //  "/{foo}" > "/a"
  //  "/a" < "/{foo}"
  // examples with templated prefix:
  //  "/{hello}/a" == "/{bye}/b"
  //  "/{hello}/{foo}" == "/{bye}/{bar}"
  //  "/{hello}/{foo}" > "/{bye}/a"
  //  "/{hello}/a" < "/{bye}/{foo}"
  // examples with hardcoded prefix:
  //  "/hello/a" == "/bye/b"
  //  "/hello/{foo}" == "/bye/{bar}"
  //  "/hello/{foo}" > "/bye/a"
  //  "/hello/a" < "/bye/{foo}"
  const pathElements1 = openApiPath1.substring(1).split(/\//);
  const pathElements2 = openApiPath2.substring(1).split(/\//);
  for (let i = 0; i < pathElements1.length && i < pathElements2.length; i++) {
    const isTemplateElement1 = pathElements1[i][0] == '{';
    const isTemplateElement2 = pathElements2[i][0] == '{';
    if (isTemplateElement1 && !isTemplateElement2) {
      return 1;
    } else if (!isTemplateElement1 && isTemplateElement2) {
      return -1;
    }
  }
  // returning 0 is valid because this function is called  with paths of the same length,
  // so we don't have to compare "/{foo}/a" and "/{bar}" for instance.
  return 0;
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames,
  OAPaths,
) => {
  let openApiPath;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathname of possiblePathnames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const OAPath of OAPaths) {
      if (OAPath === pathname) {
        return OAPath;
      }
      if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
        // favor OAPath if it is least generic than openApiPath
        if (
          !openApiPath ||
          compareOpenApiPathsByGenericity(OAPath, openApiPath) < 0
        ) {
          openApiPath = OAPath;
        }
      }
    }
  }
  return openApiPath;
};

export const defaultBasePath = '/';

export const getPathnameWithoutBasePath = (basePath, pathname) =>
  basePath === defaultBasePath ? pathname : pathname.replace(basePath, '');
