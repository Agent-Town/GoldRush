/* Stub libXdamage.so.1 — headless chrome links but never uses it.
   QueryExtension returns False => extension treated as unavailable. */
typedef unsigned long XID;
int XDamageQueryExtension(void* dpy, int* eb, int* er) { if(eb)*eb=0; if(er)*er=0; return 0; }
int XDamageQueryVersion(void* dpy, int* maj, int* min) { if(maj)*maj=1; if(min)*min=1; return 0; }
XID XDamageCreate(void* dpy, XID d, int level) { return 0; }
void XDamageDestroy(void* dpy, XID dmg) {}
void XDamageSubtract(void* dpy, XID dmg, XID repair, XID parts) {}
void XDamageAdd(void* dpy, XID drawable, XID region) {}
