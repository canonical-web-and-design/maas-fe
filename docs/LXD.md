# How to set up a local MAAS with LXD

Having a locally running MAAS where you can deploy your own virtual machines can be useful for testing things in the UI. This tutorial will take you through the process of setting up MAAS in a LXD container, and registering your host system as a LXD host that can provision virtual machines through MAAS.

## Prerequisites

- Hardware that meets the [minimum requirements](https://maas.io/docs/reference-installation-requirements)
- Knowledge of Ubuntu and basic Linux commands

Note: If you've previously installed MAAS locally, make sure you uninstall it completely, or the LXD setup will not work.

## Install and initialise LXD

1. Disable your firewall so your containers can communicate with your local network

```sh
sudo ufw disable
```

2. Install LXD

```sh
sudo snap install lxd
```

3. Initialise LXD

```sh
sudo lxd init --auto
```

You can remove the `--auto` flag if you want to go through the initialisation steps yourself - the defaults are fine for the purpose of this setup however.

## Set up LXD networks and profiles

You'll need a network where MAAS can provide DHCP, this will be where your VMs are provisioned.

4. Create and edit the `maas-kvm` network

```sh
lxc network create maas-kvm
lxc network edit maas-kvm
```

5. Paste the following config, and save

```yaml
name: maas-kvm
description: ""
type: bridge
managed: true
status: Created
config:
  ipv4.address: 10.20.0.1/24
  ipv4.dhcp: "false"
  ipv4.nat: "true"
  ipv6.address: none
used_by: []
locations:
  - none
```

6. Set the HTTPS address for LXD (this enables communication with your local network)

```sh
lxc config set core.https_address [::]:8443
```

7. Create and edit the `maas-container` profile

```sh
lxc profile create maas-container
lxc profile edit maas-container
```

8. Paste the following config, and save

```yaml
name: maas-container
description: MAAS region container
config: {}
devices:
  eth0:
    network: lxdbr0
    type: nic
  eth1:
    network: maas-kvm
    type: nic
  root:
    path: /
    pool: default
    type: disk
```

## Launch and configure a container for the MAAS region

9. Launch an Ubuntu container with the `maas-container` profile

```sh
lxc launch ubuntu:jammy some-sensible-name -p default -p maas-container
```

10. Enter the shell for the container, and switch to the `ubuntu` user

```sh
lxc shell some-sensible-name
su ubuntu
```

11. Inside the container, create a netplan config to give the container an address on the `maas-kvm` network

```sh
sudo nano /etc/netplan/99-maas-kvm-net.yaml
```

12. Paste the following config, and save

```yaml
network:   
  ethernets:  
    eth1:  
      addresses: [10.20.0.2/24]
  version: 2
```

13. Apply the new netplan configuration

```sh
sudo netplan apply
```

## Install and initialise MAAS

14. Install the latest MAAS snap, and the test database

```sh
sudo snap install maas --channel=latest/edge
sudo snap install maas-test-db --channel=latest/edge
```

15. Initialise MAAS with the following command

```sh
sudo maas init region+rack --maas-url="http://10.20.0.2:5240/MAAS" --database-uri maas-test-db:///
```

Take note of the `maas-url` here, you'll need it to log into the UI later.

16. Create your admin user

```sh
sudo maas createadmin
```

## Configure your host machine as a KVM host in MAAS

17. Paste the `maas-url` from step 15 into your browser, and log into MAAS UI. Make sure you import your SSH keys from Launchpad or GitHub
18. Click on "Subnets" in the navigation, and then click on "10.20.0.0/24". Make sure the gateway IP is "10.20.0.1"
19. Go to the VLAN for this subnet (it should show up as "untagged"), and reserve a **dynamic** range from 10.20.0.100 to 10.20.0.200
20. Click "Configure DHCP", check "MAAS provides DHCP", and make sure the IP range you just reserved shows up in the form, then submit the form.
21. On your host machine, enter `ip a` and note down the IP address of `lxdbr0`.
22. Click on "LXD" in the navigation, then click "Add LXD host" and fill in the form. You can paste the IP address from the previous step into the "LXD address" field. Select "Generate new certificate and key", and click "Next".
23. Run the command shown in the side panel on your host machine to add the newly generated certificate to LXD, then click "Check authentication".
24. Select "Add new project" and give it a name - this is where MAAS will deploy all new VMS created with this host. Then click "Save LXD host"
    And that's a wrap! You should now be able to compose virtual machines on your host using MAAS.
