/**
 * @module FileType
 * @description Constants that are used to indicate the `file type` of a file
 *
 * | Type       | Long Value  | Description |
 * | ---------- | ----------- | ----------- |
 * | None       | 0           | Unrecognized piece of data |
 * | COM        | 1           | Plain binary, less than 64K |
 * | EXE        | 2           | EXE file (Consider that old DOS executable are not PE) |
 * | DRV        | 4           | DOS Driver |
 * | BOOT       | 8           | BOOT-sector image |
 * | PE         | 1           | 16 PE file |
 * | PE         | 18          | EXE & PE file (Windows Portable Executable) |
 * | NE         | 32          | NE file |
 * | VXD        | 64          | LE / W4 file (normally Windows-VxD) |
 * | DLL non PE | 128         | Old Windows DLL (Consider that old 16bit DLL might not be PE) |
 * | PE DLL     | 144         | Windows DLL & PE |
 * | PE WIN     | 272         | Windows Executable |
 * | MZSTUB     | 512         | Windows program with non-trivial DOS stub |
 * | NLM        | 1024        | PE / NE / LE file |
 * | ELF        | 2048        | Linux binary file Linux ELF |
 * | JS         | 4096        | Javascript file Javascript |
 * | VBS        | 8192        | VB script file |
 * | SCRIPT     | 12288       | |
 * | PIC        | 65536       | Picture file |
 * | TEXT       | 131072      | Text file |
 * | BAT        | 143360L     | Batch script (.cmd .bat) |
 * | HTML       | 262144      | Hypertext file |
 * | HTA        | 524288      | Hypertext application |
 * | RTF        | 1048576     | Rich text file |
 * | PDF        | 2097152     | Adobe Acrobat file |
 * | MMEDIA     | 4194304     | Music, movie or other MM file |
 * | URL        | 8388608     | Text file with URL extension |
 * | PE         | 16777232    | Portable executable system driver (WIN, sys extension) |
 * | ARC        | 33587200    | ZIP Archive file |
 * | ARC        | 67141632    | CAB Archive file |
 * | ARC        | 134250496   | RAR Archive file |
 * | OOXMLPK    | 268435456   | OOXML in ZIP (office format for pptx, docx, etc) Office |
 * | MACH_O     | 536870912   | MAC-O binary |
 * | APK        | 1073741824  | Android application package |
 * | CLASS      | 2147483648  | Java class |
 * | JAR        | 4328554496  | Java package |
 */

'use strict'

module.exports = {
    /**
     * Unknown, not recognized.
     */
  NONE: 0,
    /**
     * Plain binary, less than 64K.
     */
  COM: 1,
    /**
     * EXE file.
     */
  EXE: 2,
    /**
     * DOS driver.
     */
  DRV: 4,
    /**
     * BOOT-sector image.
     */
  BOOT: 8,
    /**
     * PE file.
     */
  PE: 16,
    /**
     * PE-EXE file (PE + EXE).
     */
  PEEXE: 18,
    /**
     * LE/W4 file (normally Windows-VxD).
     */
  VXD: 64,
    /**
     * Windows DLL (16 bits).
     */
  DLLNONPE: 128,
    /**
     * Windows DLL.
     */
  DLL: 144,
    /**
     * Windows Executable (PE + NE + LE).
     */
  WIN: 272,
    /**
     * Windows program with non-trivial DOS stub (EXE + MZSTUB).
     */
  MZSTUB: 512,
    /**
     * Netware Loadable Module (MZSTUB << 1).
     */
  NLM: 1024,
    /**
     * ELF (linux binary) file.
     */
  ELF: 2048,
    /**
     * J-script (ELF << 1).
     */
  JS: 4096,
    /**
     * VB-script (JS << 1).
     */
  VBS: 8192,
    /**
     * Script (JS | VBS).
     */
  SCRIPT: 12288,
    /**
     * OLE document (VBS << 1).
     */
  OLE: 16384,
    /**
     * Picture file (ARC << 1).
     */
  PIC: 65536,
    /**
     * Text file (PIC << 1).
     */
  TEXT: 131072,
    /**
     * Batch script (.cmd .bat) file : TEXT + Script).
     */
  BAT: 143360,
    /**
     * Hyper-text : TEXT << 1).
     */
  HTML: 262144,
    /**
     * Hyper-text file : HTML + TEXT).
     */
  HTMLTEXT: 393216,
    /**
     * Hyper-text application : HTML << 1).
     */
  HTA: 524288,
    /**
     * Rich-text : HTA << 1).
     */
  RTF: 1048576,
    /**
     * Adobe Acrobat (RTF << 1).
     */
  PDF: 2097152,
    /**
     * Music, movie or other MM (PDF << 1).
     */
  MMEDIA: 4194304,
    /**
     * Text file with url extension (MMEDIA << 1).
     */
  URL: 8388608,
    /**
     * Portable system driver (PE + URL<<1).
     */
  SYS: 16777232,
    /**
     * ZIP (starts with pk) file (ARC + ZIP).
     */
  ZIP: 33587200,
    /**
     * CAB (starts with mscf) file (ARC + CAB).
     */
  CAB: 67141632,
    /**
     * RAR file (RAR) --> ARCHIVE flag is disabled.
     */
  RARNOARC: 134217728,
    /**
     * RAR file (ARC + RAR).
     */
  RAR: 134250496,
    /**
     * MS Office document (Legacy - Backward Compatible - ENS 10.5.1).
     */
  OOXML: 167772160,
    /**
     * MS Office document (ZIP + RAR << 1).
     */
  OOXMLPK: 301989888,
    /**
     * MAC-O binary (OOXMLPK << 1).
     */
  MACHO: 536870912,
    /**
     * Android application package (MACHO << 1).
     */
  APK: 1073741824,
    /**
     * Java class file (APK.value << 1).
     */
  CLASS: 2147483648,
    /**
     * Java package (ZIP + ARC + CLASS << 1).
     */
  JAR: 4328554496
}
