# Receipt wrapper failure

The first independent read-only probe batch saved child stdout/stderr, then failed to create receipts because the wrapper referenced an undeclared `name`. No child exit status was retained, so the corrected wrapper repeats the probes and records their actual exit codes. Maintained source is unchanged.
