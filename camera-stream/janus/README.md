## Notes on janus docker compose:

### libsrtp compilation with OpenSSL support

The default apt package for libsrtp does not have the `--enable-openssl` included. Janus requires this flag or errors will be thrown. Therefore the package must be compiled at build time. 
