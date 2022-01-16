/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['@monorepo/shared']);

module.exports = withTM();
