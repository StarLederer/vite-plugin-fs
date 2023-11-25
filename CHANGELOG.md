# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2023-11-25

### Added

- Binary data support to `writeFile`.

### Fixed

- Incorrect handling of international characters in paths.
- Incorrect `readdir` return type when not `withFileTypes: true`.
