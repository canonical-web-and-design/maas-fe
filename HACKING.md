# Hacking

- Project conventions
  - [TypeScript](#Typescript)
    - [Dealing with problems](#dealing-with-problems)
    - [Betterer](#betterer)
- Development setup
  - [Development setup](#development-setup)
  - [Running a branch](#running-a-branch)
  - [Setting up or connecting to a MAAS](#maas-deployments)
  - [Creating a Multipass instance](#creating-a-multipass-instance)
  - [Creating a LXD instance](#creating-a-lxd-instance)
  - [Building a production bundle](#building)
  - [Creating a fake windows image](#creating-a-fake-windows-image)
  - [Show intro](#show-intro)
- Testing
  - [Integration tests](#integration-tests)
  - [Unit tests](#unit-tests)
- [Adding a new yarn workspace](#adding-a-new-yarn-workspace)

# Project conventions

## TypeScript

maas-ui is in the process of migrating `ui` to TypeScript. Any new modules in `ui` should be written in [TypeScript](https://www.typescriptlang.org/), however `legacy` is exempt.

If your branch touches an existing js module in `ui`, it should be converted to TypeScript. The maas-ui maintainers are happy to help with any issues you might encounter.

### Dealing with problems

There are cases where determining a type for a particular object can be difficult. We provide an "escape hatch" type called `TSFixMe` (aliased to `any`) which you can use, but please make a best effort to avoid this and determine the correct types where possible.

### Betterer

maas-ui uses [betterer](https://github.com/phenomnomnominal/betterer) to assist with our goal of enabling TypeScript's `strict` compile option. Once you are ready to create a PR against maas-ui, please run `yarn betterer`, and make a best effort to correct any TypeScript issues your branch may have introduced. CI will block your PR if you have introduced a `strict` mode regression.

If you are unable to address the compiler errors, you can as a last resort run `yarn betterer --update` to force an update of the betterer snapshot. Please do not do this as a matter of course, but seek help if you are having trouble satisfying the compiler.

# Development setup

**Note: You will need access to a running instance of MAAS in order to run maas-ui.**

## Set up a development container

### Start the instance

You may wish to use an existing instance, or you can [create a Multipass instance](#creating-a-multipass-instance) or [create a LXD instance](#creating-a-lxd-instance).

For now we'll assume you have an instance called "dev".

#### Multipass

Start your instance:

```shell
multipass start dev
```

Make sure your instance has [SSH credentials](#ssh-credentials) and then SSH into your machine, optionally with agent forwarding:

```shell
ssh [-A] multipass@dev.local
```

#### LXD

Start your instance:

```shell
lxc start dev
```

Connect to the instance as the provided `ubuntu` user:

```shell
lxc exec dev bash -- su ubuntu
```

### Clone the repository

If you're planning to contribute changes to maas-ui then first you'll need to make a fork of the [maas-ui project](https://github.com/canonical-web-and-design/maas-ui) in GitHub.

Then, inside your MAAS container clone the maas-ui repository.

```shell
git clone -o upstream git@github.com:canonical-web-and-design/maas-ui
cd maas-ui
git remote add origin git@github.com:<github-username>/maas-ui
```

Otherwise you can just use:

```shell
git clone git@github.com:canonical-web-and-design/maas-ui
cd maas-ui
```

### Edit local config

By default maas-ui will connect to `bolla.internal` which requires Canonical VPN access. Bolla runs on MAAS edge, which is the latest development version available.

If you wish to develop against a different MAAS then you can create a local env:

```shell
touch proxy/.env.local
```

Update the contents of that file to point to a MAAS. [See the section on MAAS deployments](#maas-deployments).

```shell
MAAS_URL="http://<maas-ip-or-hostname>:5240/"
```

The easiest way to run maas-ui is with [Dotrun](https://github.com/canonical-web-and-design/dotrun). You can install it with:

```shell
sudo snap install dotrun
```

You should now be able to run maas-ui and log into your MAAS:

```shell
dotrun
```

Once everything has built you can access the site using the hostname:

[http://dev.local:8400/MAAS/](http://dev.local:8400/MAAS/).

### Running a branch

To run a branch from a PR you can find and click on the link "command line instructions" and copy the command from "Step 1". It should look something like:

```shell
git checkout -b username-branch-name master
git pull https://github.com/username/maas-ui.git branch-name
```

Run those commands from the maas-ui dir (`cd ~/maas-ui`).

Then run the branch with:

```shell
dotrun
```

If something doesn't seem right you can try:

```shell
dotrun clean
dotrun
```

# MAAS deployments

## Canonical VPN deployments

If you have access to the Canonical VPN you can use one of the following MAAS deployments. You may need to do some [additional configuration](#vpn-configuration) inside your multipass instance.

Once connected to the VPN you can connect to one of the following MAAS deployments using the [credentials](https://wiki.canonical.com/WebAndDesign/DesignMaasLab).

### Karura

[karura.internal](http://karura.internal:5240/MAAS) (last stable release).

### Bolla

[bolla.internal](http://bolla.internal:5240/MAAS) (master)

## Local deployments

### Snap deployment

The easiest way to run a MAAS locally is using a snap. However, this method does not provide sample data and therefore will not have everything e.g. there will be no machines.

First you'll need to either [create a Multipass instance](#creating-a-multipass-instance) or [create a LXD container](#creating-a-lxd-container), call it something like "snap-maas".

Then enter the shell for that instance:

#### Multipass

```shell
multipass shell snap-maas
```

#### LXD

```shell
lxc exec snap-maas bash -- su ubuntu
```

Now install MAAS and a test database:

```shell
sudo snap install maas maas-test-db
```

Once that has completed you'll need to intialise the MAAS:

```shell
sudo maas init region+rack --database-uri maas-test-db:///
```

Now create a user:

```shell
sudo maas createadmin
```

You should now be able to access the MAAS in your browser:

[http://snap-maas.local:8400/MAAS/](http://snap-maas.local:8400/MAAS/).

You might now need to [configure maas-ui](#edit-local-config) to use this MAAS.

#### Updating a snap MAAS

To update your MAAS manually you can run:

```shell
sudo snap refresh maas
```

You can update to a different version with something like:

```shell
sudo snap refresh --channel=2.8 maas
```

### Development deployment

First you'll need to either [create a Multipass instance](#creating-a-multipass-instance) or [create a LXD container](#creating-a-lxd-instance), call it something like "dev-maas".

Then enter the shell for that instance:

#### Multipass

```shell
multipass shell dev-maas
```

#### LXD

```
lxc exec dev-maas bash -- su ubuntu
```

You'll need to fetch the current MAAS master:

```shell
git clone http://git.launchpad.net/maas
```

And then build MAAS and set up some sampledata:

```shell
cd maas
make install-dependencies
make
make syncdb
make sampledata
```

Now you should be ready to start the MAAS, you'll need to do this each time you start the Multipass instance.

```shell
make start
```

At this point you can [configure maas-ui](#edit-local-config) to use this maas with the default credentials (admin/test). If you wish to view the ui from that MAAS deployment you'll need to [build the UI](#running-maas-ui-from-a-development-maas).

#### Stopping a development MAAS

If you need to stop the MAAS you can run:

```shell
ps -ef | grep 'regiond' | grep -v grep | awk '{print $2}' | xargs -r kill -9
```

#### Updating a development MAAS

Enter the shell for your MAAS instance:

#### Multipass

```shell
multipass shell dev-maas
```

#### LXD

```shell
lxc exec dev-maas -- su ubuntu
```

If MAAS is currently running then [stop it](#stopping-a-development-maas).

Now fetch the latest master, clean and rebuild your MAAS.

_Note: this will clear all your MAAS data and is more reliable, but you can attempt to run `make clean` instead of `make clean+db` to preserve your current data._

```shell
cd ~/maas
make clean+db
git pull
make install-dependencies
make
make syncdb
make sampledata
make start
```

#### Running maas-ui from a development maas

If you have previously built the UI then run:

```shell
cd ~/maas
make clean-ui
```

Optional: if you wish to use a specific branch of maas-ui then run:

```shell
git config --file=.gitmodules submodule.src/maasui/src.url https://github.com/[github-username]/maas-ui.git
git config --file=.gitmodules submodule.src/maasui/src.branch [branch name]
git submodule sync
git submodule update --init --recursive --remote
```

Optional: if you want to restore to maas-ui master then run:

```shell
git checkout .gitmodules
git submodule sync
git submodule update --init --recursive --remote
```

Now you can make the UI

```shell
make ui
```

If that fails you can try:

```shell
SKIP_PREFLIGHT_CHECK=true make ui
```

You should now be able to access the MAAS in your browser:

[http://dev-maas.local:8400/MAAS/](http://dev-maas.local:8400/MAAS/).

# Creating a Multipass instance

## Install Multipass

First, install Multipass:

- [on Linux](https://multipass.run/docs/installing-on-linux), or
- [on a Mac](https://multipass.run/docs/installing-on-macos).

## Create the instance:

To be able to run maas-ui or MAAS you should allocate as many resources as you can to the instance. Don't worry, it'll share the CPU and RAM with the host and only take up the disk space it currently requires.

_Note: you can't increase the disk size once the instance has been created_

Check what resources your computer has and then run:

```shell
multipass launch -c [the number of cores] -d [some amount of disk space] -m [the amount of ram] --name [the instance name]
```

You should end up with a command something like this:

```shell
multipass launch -c 4 -d 20G -m 16G --name dev
```

## SSH credentials

You have two options for having SSH credentials in your Multipass instance.

### Host credentials

This method allows you to use the SSH credentials from your host machine and doesn't require you to create new SSH credentials for each Multipass instance.

You can follow [this guide](https://help.github.com/en/github/authenticating-to-github/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) for setting up the ssh-agent.

Then you can log into your instance with:

```shell
ssh -A multipass@[instance-name].local
```

### Instance credentials

Access your instance with:

```shell
multipass shell [instance-name]
```

Then [generate a new SSH key](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and [add it to your Github account](https://help.github.com/en/articles/adding-a-new-ssh-key-to-your-github-account).

### macOS

#### VPN configuration

To connect to a remote MAAS over the VPN, you'll need to configure _nat_ on your macOS host:

1. run `ifconfig` and make note of the `utun` interfaces.
2. For every `utun` interface, add the following line to `/etc/pf.conf` directly after any existing `nat-anchor` or `nat` commands (the order is significant):

```shell
nat on utun0 from bridge100:network to any -> (utun0)
```

3. Run `sudo pfctl -f /etc/pf.conf` to update configuration.
4. You should be able to `ping karura.internal` from your maas multipass.

Be aware that this may prevent reaching hosts on your internal network. You can of course comment out the `nat` configuration and rerun `sudo pfctl -f /etc/pf.conf` to reset everything.

# Creating a LXD instance

## Install LXD on Linux

The recommended way to install LXD is with the snap. For the latest stable release, use:

```shell
snap install lxd
```

If you previously had the LXD deb package installed, you can migrate all your existing data over with:

```shell
lxd.migrate
```

See the [official LXD docs](https://linuxcontainers.org/lxd/getting-started-cli/#installation) for information on installing LXD on other OSes.

## Initialise LXD

By default, LXD comes with no configured network or storage. You can get a basic configuration suitable for MAAS with:

```shell
lxd init
```

## Launch the instance

You can launch an instance with the command `lxc launch`:

```shell
lxc launch imageserver:imagename instancename
```

For example, to create an instance based on the Ubuntu Focal Fossa image with the name `focal-maas`, you would run:

```shell
lxc launch ubuntu:20.04 focal-maas
```

See [the image server for LXC and LXD](https://us.images.linuxcontainers.org/) for a list of available images.

## Container credentials

Access your instance with:

```shell
lxc exec [container-name] bash -- su ubuntu
```

Then [generate a new SSH key](https://help.github.com/en/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent) and [add it to your Github account](https://help.github.com/en/articles/adding-a-new-ssh-key-to-your-github-account).

# Building

Ensure both node (current LTS) and yarn are installed.

From the root of the MAAS UI project run:

```shell
yarn build-all
```

An optimised production bundle will be built, and output to `./build`.

# Creating a fake windows image

You can create a fake Windows image if you need to test MAAS with a windows image (e.g. for managing license keys).

Note: you will need a local [development](#development-deployment) or [snap](#snap-deployment) MAAS.

Connect to you instance:

#### Multipass

```shell
multipass shell dev-maas
```

#### LXD

```shell
lxc exec dev-maas bash -- su ubuntu
```

## Create the image

Now create a fake Windows image:

```shell
dd if=/dev/zero of=windows-dd bs=512 count=10000
```

## Login to MAAS

You will need to log in to the CLI (if you haven't before).

You will be prompted for you API key which you can get from `<your-maas-url>:5240/MAAS/r/account/prefs/api-keys`.

#### Development MAAS

```shell
<path-to-maas-dir>/bin/maas login <new-profile-name> http://localhost:5240/MAAS/
```

#### Snap MAAS

```shell
maas login <new-profile-name> http://localhost:5240/MAAS/
```

## Upload the image

Ensure you have downloaded and synced an amd64 ubuntu image (via `<your-maas-url>:5240/MAAS/l/images`), this is required to populate architecture for the following step.

Now you can upload the image (remember to use `<path-to-maas-dir>/bin/maas/...` if you're using a development MAAS):

```shell
maas <profile-name> boot-resources create name=windows/win2012 title="Windows Server 2012" architecture=amd64/generic filetype=ddtgz content@=windows-dd
```

Then you should be able to visit `<your-maas-url>:5240/MAAS/l/images` and your Windows image should appear under the "Custom Images" section.

## License keys

If you're testing license keys the format is: `XXXXX-XXXXX-XXXXX-XXXXX-XXXXX`.

# Show intro

First you'll need to [log in](#login-to-maas) to the MAAS cli.

Then you reset the config to display the intro.

```shell
maas $PROFILE maas set-config name=completed_intro value=false
```

# Testing

## Integration tests

Integration tests currently run against the maas edge snap (master) [on github actions](https://github.com/canonical-web-and-design/maas-ui/actions?query=workflow%3ACypress) with [Cypress](https://cypress.io).

For details on developing integration tests, see the integration testing [README](integration/README.md).

## Unit tests

Integration tests are run for each workspace and use [Jest](https://jestjs.io/) and [Enzyme](https://enzymejs.github.io/enzyme/).

All test suites can be run with:

```shell
dotrun test
```

Tests suites can be run for each workspace:

```shell
dotrun test-ui
dotrun test-legacy
dotrun test-shared
```

To run tests and watch for changes you can pass `--watchAll=true` e.g.:

```shell
dotrun test-ui --watchAll=true
```

You can run tests against a single file:

```shell
dotrun test-ui MachineTestsTable.test.tsx
dotrun test-ui MachineTestsTable
dotrun test-ui --watchAll=true MachineTestsTable
```

To run a single test you can add `.only` to the test case or block.

_Note: this only limits the tests in a single file. You will also need to make sure you are only running that file._

```javascript
describe.only("NetworkTable", () => {
it.only("displays a spinner when loading", () => {
```

# Adding a new yarn workspace

To add a new yarn workspace, edit `package.json` and add the project's directory name to the `workspaces` array.

To import modules from existing projects in your new project, add the dependant projects to your projects dependencies in `package.json`.
