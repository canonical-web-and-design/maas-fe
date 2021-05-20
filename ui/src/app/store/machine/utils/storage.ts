import { MIN_PARTITION_SIZE } from "app/store/machine/constants";
import { DiskTypes, StorageLayout } from "app/store/machine/types";
import type {
  Disk,
  Filesystem,
  Machine,
  Partition,
} from "app/store/machine/types";
import { NodeStatusCode } from "app/store/types/node";
import { formatBytes, getNextName } from "app/utils";

/**
 * Returns whether a disk can be deleted.
 * @param disk - the disk to check.
 * @returns whether the disk can be deleted
 */
export const canBeDeleted = (disk: Disk | null): boolean => {
  if (!disk) {
    return false;
  }
  if (isVolumeGroup(disk)) {
    return disk.used_size === 0;
  }
  return !disk.partitions || disk.partitions.length === 0;
};

/**
 * Returns whether a filesystem can be formatted.
 * @param fs - the filesystem to check.
 * @returns whether the filesystem can be formatted
 */
export const canBeFormatted = (fs: Filesystem | null): boolean =>
  fs?.is_format_fstype || false;

/**
 * Returns whether a disk can be partitioned.
 * @param disk - the disk to check.
 * @returns whether the disk can be partitioned.
 */
export const canBePartitioned = (disk: Disk | null): boolean => {
  if (
    !disk ||
    isBcache(disk) ||
    isLogicalVolume(disk) ||
    isVolumeGroup(disk) ||
    isMounted(disk.filesystem)
  ) {
    return false;
  }

  // TODO: This does not take into account space that needs to be reserved.
  // https://github.com/canonical-web-and-design/MAAS-squad/issues/2274
  return disk.available_size >= MIN_PARTITION_SIZE;
};

/**
 * Returns whether a storage device can create a bcache.
 * @param machineDisks - all of the machine's disks.
 * @param storageDevice - the storage device to check.
 * @returns whether the storage device can create a bcache.
 */
export const canCreateBcache = (
  machineDisks: Disk[],
  storageDevice: Disk | Partition | null
): boolean => {
  if (!storageDevice || !machineDisks.some((disk) => isCacheSet(disk))) {
    return false;
  }

  if (
    isDisk(storageDevice) &&
    (storageDevice.partitions?.length ||
      isVolumeGroup(storageDevice) ||
      isBcache(storageDevice))
  ) {
    return false;
  }

  if (isFormatted(storageDevice.filesystem)) {
    return false;
  }

  return true;
};

/**
 * Returns whether a storage device can create a cache set.
 * @param storageDevice - the storage device to check.
 * @returns whether the storage device can create a cache set.
 */
export const canCreateCacheSet = (
  storageDevice: Disk | Partition | null
): boolean => {
  if (!storageDevice) {
    return false;
  }

  if (
    isDisk(storageDevice) &&
    (storageDevice.partitions?.length || isVolumeGroup(storageDevice))
  ) {
    return false;
  }

  if (isFormatted(storageDevice.filesystem)) {
    return false;
  }

  return true;
};

/**
 * Returns whether a disk can create a logical volume.
 * @param disk - the disk to check.
 * @returns whether the disk can create a logical volume.
 */
export const canCreateLogicalVolume = (disk: Disk | null): boolean =>
  isVolumeGroup(disk) && diskAvailable(disk);

/**
 * Returns whether a list of storage devices can create or update a datastore.
 * @param storageDevices - the list of disks and partitions to check.
 * @returns whether the list of storage devices can create or update a datastore.
 */
export const canCreateOrUpdateDatastore = (
  storageDevices: (Disk | Partition)[]
): boolean => {
  if (
    storageDevices.length === 0 ||
    storageDevices.some((device) => isFormatted(device.filesystem))
  ) {
    return false;
  }

  for (const device of storageDevices) {
    if (isDisk(device)) {
      if (
        device.partitions?.length ||
        isBcache(device) ||
        isLogicalVolume(device) ||
        isVolumeGroup(device)
      ) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Returns whether a list of storage devices can create a RAID.
 * @param storageDevices - the list of disks and partitions to check.
 * @returns whether the list of storage devices can create a RAID.
 */
export const canCreateRaid = (
  storageDevices: (Disk | Partition)[]
): boolean => {
  if (storageDevices.length <= 1) {
    return false;
  }

  for (const device of storageDevices) {
    if (
      isDisk(device) &&
      (device.partitions?.length > 0 || isVolumeGroup(device))
    ) {
      return false;
    }

    if (isFormatted(device.filesystem)) {
      return false;
    }
  }
  return true;
};

/**
 * Returns whether a list of storage devices can create a volume group.
 * @param storageDevices - the list of disks and partitions to check.
 * @returns whether the list of storage devices can create a volume group.
 */
export const canCreateVolumeGroup = (
  storageDevices: (Disk | Partition)[]
): boolean => {
  if (
    storageDevices.length === 0 ||
    storageDevices.some((device) => isFormatted(device.filesystem))
  ) {
    return false;
  }

  for (const device of storageDevices) {
    if (isDisk(device)) {
      if (device.partitions?.length > 0 || isVolumeGroup(device)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * Check whether a machine's OS supports bcache and ZFS.
 * @param machine - A machine object.
 * @returns Whether the machine's OS supports bcache and ZFS.
 */
export const canOsSupportBcacheZFS = (machine?: Machine | null): boolean =>
  !!machine && machine.osystem === "ubuntu";

/**
 * Check whether a machine's OS allows storage configuration.
 * @param machine - A machine object.
 * @returns Whether the machine's OS allows storage configuration.
 */
export const canOsSupportStorageConfig = (machine?: Machine | null): boolean =>
  !!machine && ["centos", "rhel", "ubuntu"].includes(machine.osystem);

/**
 * Returns whether a disk can be set as the machine's boot disk.
 * @param storageLayout - the machine's detected storage layout.
 * @param disk - the disk to check.
 * @returns whether the disk can be set as the machine's boot disk.
 */
export const canSetBootDisk = (
  storageLayout: StorageLayout,
  disk: Disk
): boolean =>
  storageLayout !== StorageLayout.VMFS6 && isPhysical(disk) && !disk.is_boot;

/**
 * Returns whether a disk is available to use.
 * @param disk - the disk to check.
 * @returns whether the disk is available to use
 */
export const diskAvailable = (disk: Disk | null): boolean => {
  if (!disk || isCacheSet(disk) || isMounted(disk.filesystem)) {
    return false;
  }

  if (isRaid(disk)) {
    return true;
  }
  return disk.available_size >= MIN_PARTITION_SIZE;
};

/**
 * Formats a storage device's size for use in tables.
 * @param size - the size of the storage device in bytes.
 * @returns formatted size string.
 */
export const formatSize = (size: number | null): string => {
  const formatted = !!size && formatBytes(size, "B", { roundFunc: "floor" });
  return formatted ? `${formatted.value} ${formatted.unit}` : "—";
};

/**
 * Formats a storage device's type for use in tables.
 * @param storageDevice - the storage device to check.
 * @param sentenceForm - whether the returned string is used in a sentence.
 * @returns formatted type string.
 */
export const formatType = (
  storageDevice: Disk | Partition | null,
  sentenceForm = false
): string => {
  if (!storageDevice) {
    return "Unknown";
  }

  if (isPartition(storageDevice)) {
    return sentenceForm ? "partition" : "Partition";
  }

  let typeToFormat = storageDevice.type;
  const disk = storageDevice as Disk;
  if (isVirtual(disk)) {
    if (isLogicalVolume(disk)) {
      return sentenceForm ? "logical volume" : "Logical volume";
    } else if (isRaid(disk)) {
      const raidLevel = disk.parent?.type.split("-")[1];
      return raidLevel ? `RAID ${raidLevel}` : "RAID";
    }
    typeToFormat = disk.parent?.type || "Unknown";
  }

  switch (typeToFormat) {
    case DiskTypes.CACHE_SET:
      return sentenceForm ? "cache set" : "Cache set";
    case DiskTypes.ISCSI:
      return "ISCSI";
    case DiskTypes.VOLUME_GROUP:
      return sentenceForm ? "volume group" : "Volume group";
    case DiskTypes.PHYSICAL:
      return sentenceForm ? "physical disk" : "Physical";
    case DiskTypes.VIRTUAL:
      return sentenceForm ? "virtual disk" : "Virtual";
    case DiskTypes.VMFS6:
      return "VMFS6";
    default:
      return typeToFormat;
  }
};

/**
 * Returns a disk given the disk's id.
 * @param disks - the disks to check.
 * @param diskId - the disk id.
 * @returns disk that matches id.
 */
export const getDiskById = (disks: Disk[], diskId: Disk["id"]): Disk | null => {
  if (disks && disks.length > 0) {
    return disks.find((disk) => disk.id === diskId) || null;
  }
  return null;
};

/**
 * Returns a disk partition given the partition's id.
 * @param disks - the disks to check the partitions of.
 * @param partitionId - the partition id.
 * @returns partition that matches id.
 */
export const getPartitionById = (
  disks: Disk[],
  partitionId: Partition["id"]
): Partition | null => {
  if (disks && disks.length > 0) {
    for (const disk of disks) {
      if (disk.partitions) {
        for (const partition of disk.partitions) {
          if (partition.id === partitionId) {
            return partition;
          }
        }
      }
    }
  }
  return null;
};

/**
 * Returns whether a disk is a bcache.
 * @param disk - the disk to check.
 * @returns whether the disk is a bcache
 */
export const isBcache = (disk: Disk | null): boolean =>
  isVirtual(disk) && disk?.parent?.type === DiskTypes.BCACHE;

/**
 * Returns whether a disk is a cache set.
 * @param disk - the disk to check.
 * @returns whether the disk is a cache set
 */
export const isCacheSet = (disk: Disk | null): boolean =>
  disk?.type === DiskTypes.CACHE_SET;

/**
 * Returns whether a filesystem is a VMFS6 datastore.
 * @param fs - the filesystem to check.
 * @returns whether the filesystem is a VMFS6 datastore
 */
export const isDatastore = (fs: Filesystem | null): boolean =>
  fs?.fstype === "vmfs6";

/**
 * Returns whether a storage device is a disk.
 * @param storageDevice - the storage device to check.
 * @returns whether the storage device is a disk
 */
export const isDisk = (
  storageDevice: Disk | Partition | null
): storageDevice is Disk =>
  Boolean(storageDevice) && storageDevice?.type !== "partition";

/**
 * Returns whether a filesystem is formatted.
 * @param fs - the filesystem to check.
 * @returns whether the filesystem is formatted
 */
export const isFormatted = (fs: Filesystem | null): boolean =>
  fs !== null && fs.fstype !== "";

/**
 * Returns whether a disk is a logical volume.
 * @param disk - the disk to check.
 * @returns whether the disk is a logical volume
 */
export const isLogicalVolume = (disk: Disk | null): boolean =>
  (isVirtual(disk) && disk?.parent?.type === DiskTypes.VOLUME_GROUP) || false;

/**
 * Check whether a machine's status allows storage configuration.
 * @param machine - A machine object.
 * @returns Whether the machine's status allows storage configuration.
 */
export const isMachineStorageConfigurable = (
  machine?: Machine | null
): boolean =>
  !!machine &&
  [NodeStatusCode.READY, NodeStatusCode.ALLOCATED].includes(
    machine.status_code
  );

/**
 * Returns whether a filesystem is mounted.
 * @param fs - the filesystem to check.
 * @returns whether the filesystem is mounted
 */
export const isMounted = (fs: Filesystem | null): fs is Filesystem => {
  if (!fs) {
    return false;
  }

  // VMware ESXi does not directly mount the partitions used. As MAAS can't
  // model that, a placeholder "RESERVED" is used for datastores so we know that
  // these partitions are in use.
  return Boolean(fs.mount_point) && fs.mount_point !== "RESERVED";
};

/**
 * Returns whether a storage device is a partition.
 * @param storageDevice - the storage device to check.
 * @returns whether the storage device is a partition
 */
export const isPartition = (storageDevice: Disk | Partition | null): boolean =>
  storageDevice?.type === "partition";

/**
 * Returns whether a disk is a physical disk.
 * @param disk - the disk to check.
 * @returns whether the disk is a physical disk
 */
export const isPhysical = (disk: Disk | null): boolean =>
  disk?.type === DiskTypes.PHYSICAL;

/**
 * Returns whether a disk is a RAID.
 * @param disk - the disk to check.
 * @returns whether the disk is a RAID
 */
export const isRaid = (disk: Disk | null): boolean =>
  (isVirtual(disk) && disk?.parent?.type.startsWith("raid-")) || false;

/**
 * Returns whether a disk is a virtual disk.
 * @param disk - the disk to check.
 * @returns whether the disk is a virtual disk
 */
export const isVirtual = (disk: Disk | null): boolean =>
  disk?.type === DiskTypes.VIRTUAL && "parent" in disk;

/**
 * Returns whether a disk is a volume group.
 * @param disk - the disk to check.
 * @returns whether the disk is a volume group
 */
export const isVolumeGroup = (disk: Disk | null): boolean =>
  disk?.type === DiskTypes.VOLUME_GROUP;

/**
 * Returns whether a partition is available to use.
 * @param partition - the partition to check.
 * @returns whether the partition is available to use
 */
export const partitionAvailable = (partition: Partition | null): boolean => {
  if (!partition || isMounted(partition.filesystem)) {
    return false;
  }

  return partition.filesystem === null || canBeFormatted(partition.filesystem);
};

/**
 * Converts a list of storage devices into separated disk ids and partition ids
 * @param storageDevices - the storage devices whose ids are to be separated
 * @returns an array of disk ids and an array of partition ids
 */
export const splitDiskPartitionIds = (
  storageDevices: (Disk | Partition)[]
): [Disk["id"][], Partition["id"][]] =>
  storageDevices.reduce<[Disk["id"][], Partition["id"][]]>(
    ([diskIds, partitionIds], storageDevice: Disk | Partition) => {
      if (isDisk(storageDevice)) {
        diskIds.push(storageDevice.id);
      } else {
        partitionIds.push(storageDevice.id);
      }
      return [diskIds, partitionIds];
    },
    [[], []]
  );

/**
 * Returns whether a filesystem type uses storage.
 * @param fs - the filesystem type to check.
 * @returns whether the filesystem type uses storage
 */
export const usesStorage = (fstype: Filesystem["fstype"] | null): boolean => {
  if (!fstype) {
    return false;
  }
  return !["ramfs", "tmpfs"].includes(fstype);
};

/**
 * Find the next available name for a storage device.
 * @param disks - A machine's disks.
 * @param prefix - A network interface type.
 * @param nic - A network interface.
 * @param vlan - A VLAN.
 * @return An available name.
 */
export const getNextStorageName = (
  disks: Disk[] | null,
  prefix: "vg" | "md" | "bcache" | "datastore"
): string | null => {
  if (!disks) {
    return null;
  }
  // Everything but datastores start their index at 0.
  const startIndex = prefix === "datastore" ? 1 : 0;
  // Get a list of the current names for the provided type.
  const diskNames = disks.reduce<string[]>((names, disk) => {
    if (
      // Filter volume groups.
      (prefix === "vg" && isVolumeGroup(disk)) ||
      // Filter raids.
      (prefix === "md" && isRaid(disk)) ||
      // Filter bcaches.
      (prefix === "bcache" && isBcache(disk)) ||
      // Filter datastores
      (prefix === "datastore" && isDatastore(disk.filesystem))
    ) {
      names.push(disk.name);
    }
    return names;
  }, []);
  return getNextName(diskNames, prefix, startIndex);
};
