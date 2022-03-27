/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isNodeError(error: any): error is NodeJS.ErrnoException {
  return 'code' in error;
}

export default isNodeError;
