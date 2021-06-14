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

const countPathParams = (openApiPath) => {
  return (openApiPath.match(/\{/g) || []).length;
};

export const findOpenApiPathMatchingPossiblePathnames = (
  possiblePathnames,
  OAPaths,
) => {
  let openApiPath;
  let nbPathParams = -1;
  // eslint-disable-next-line no-restricted-syntax
  for (const pathname of possiblePathnames) {
    // eslint-disable-next-line no-restricted-syntax
    for (const OAPath of OAPaths) {
      const count = countPathParams(OAPath);
      if (OAPath === pathname) {
        return OAPath;
      }
      if (doesOpenApiPathMatchPathname(OAPath, pathname)) {
        if (nbPathParams == -1 || count < nbPathParams) {
          nbPathParams = count;
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
