# clear-redis

Clear Redis using a pattern


## Installation

`npm install -g clear-redis`

## Usage

`clear-redis --help`

## Options

```
Options:
  --help         Show help                                             [boolean]
  --version      Show version number                                   [boolean]
  --dry, -d      Dry Run                                               [boolean]
  --pattern, -r  Regex pattern                                         [string] [required]
  --ports, -p    Comma-separated list of ports                         [string] [required]
  --servers, -s  Comma-separated list of server IP Addresses/Hostnames [string] [required]
```

## Example

`clear-redis --servers "10.0.0.1,10.0.0.2" --ports "7001,7002" --pattern "MyPrefix|*" --dry`

Output:

```
Found 712 keys on 10.0.0.1:7001.
Successfully deleted 712 keys.
Found 664 keys on 10.0.0.1:7002.
Successfully deleted 664 keys.
Found 717 keys on 10.0.0.2:7001.
Successfully deleted 717 keys.
Found 668 keys on 10.0.0.2:7002.
Successfully deleted 668 keys.
```