/// <reference path="../.astro/types.d.ts" />

interface Locals {
  tenant: import('./lib/tenant').TenantInfo | null;
  auth: import('./lib/auth').JwtPayload | null;
  erro?: string;
}

declare namespace App {
  interface Locals {
    tenant: import('./lib/tenant').TenantInfo | null;
    auth: import('./lib/auth').JwtPayload | null;
    erro?: string;
  }
}
