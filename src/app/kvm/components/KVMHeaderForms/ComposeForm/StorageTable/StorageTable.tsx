import { useEffect } from "react";

import {
  Button,
  Spinner,
  Table,
  TableCell,
  TableHeader,
  TableRow,
} from "@canonical/react-components";
import { useFormikContext } from "formik";
import { useSelector } from "react-redux";

import type { Disk, ComposeFormValues } from "../ComposeForm";

import PoolSelect from "./PoolSelect";

import FormikField from "app/base/components/FormikField";
import TableActions from "app/base/components/TableActions";
import TagNameField from "app/base/components/TagNameField";
import podSelectors from "app/store/pod/selectors";
import type { Pod } from "app/store/pod/types";
import type { RootState } from "app/store/root/types";

type Props = {
  defaultDisk: Disk;
  hostId: Pod["id"];
};

export const StorageTable = ({ defaultDisk, hostId }: Props): JSX.Element => {
  const pod = useSelector((state: RootState) =>
    podSelectors.getById(state, hostId)
  );
  const composingPods = useSelector(podSelectors.composing);
  const { handleChange, setFieldTouched, setFieldValue, touched, values } =
    useFormikContext<ComposeFormValues>();
  const { bootDisk, disks } = values;

  // Ensure initial disk is always validated correctly.
  useEffect(() => {
    if (disks.length && !(touched.disks?.length && touched.disks[0].size)) {
      setFieldTouched("disks[0].size", true, true);
    }
  }, [disks, setFieldTouched, touched]);

  const addDisk = () => {
    const ids = disks.map((disk) => disk.id);
    let id = 0;
    while (ids.includes(id)) {
      id++;
    }
    setFieldTouched(`disks[${disks.length}].size`, true, true);
    setFieldValue("disks", [...disks, { ...defaultDisk, id }], true);
  };

  const removeDisk = (id: number) => {
    const filteredDisks = disks.filter((disk) => disk.id !== id);
    setFieldValue("disks", filteredDisks);

    // If boot disk is removed, set boot to first disk in the remaining array.
    if (!filteredDisks.some((disk) => disk.id === bootDisk)) {
      setFieldValue("bootDisk", filteredDisks[0]?.id);
    }
  };

  if (!!pod) {
    const disabled = !!composingPods.length;

    return (
      <>
        <div className="u-flex--between">
          <h4>Storage configuration</h4>
          <Button
            className="u-hide--medium u-hide--large"
            hasIcon
            onClick={addDisk}
            type="button"
          >
            <i className="p-icon--plus"></i>
            <span>Add disk</span>
          </Button>
        </div>
        <Table className="kvm-compose-storage-table p-form--table" responsive>
          <thead>
            <TableRow>
              <TableHeader>Size (GB)</TableHeader>
              <TableHeader>Location</TableHeader>
              <TableHeader>Tags</TableHeader>
              <TableHeader>Boot</TableHeader>
              <TableHeader className="u-align--right">Actions</TableHeader>
            </TableRow>
          </thead>
          <tbody>
            {disks.map((disk, i) => {
              const isBootDisk = disk.id === bootDisk;
              return (
                <TableRow key={disk.id}>
                  <TableCell data-heading="Size">
                    <FormikField
                      caution={
                        isBootDisk && disk.size < 8
                          ? "Ubuntu typically requires 8GB minimum."
                          : undefined
                      }
                      min="1"
                      name={`disks[${i}].size`}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const value = parseFloat(e.target.value) || "";
                        if (value === "" || value >= 0) {
                          handleChange(e);
                          setFieldTouched(`disks[${i}].size`, true, true);
                          setFieldValue(`disks[${i}].size`, value);
                        }
                      }}
                      step="any"
                      type="number"
                    />
                  </TableCell>
                  <TableCell data-heading="Location">
                    <PoolSelect
                      disk={disk}
                      hostId={hostId}
                      selectPool={(poolName?: string) => {
                        setFieldValue(`disks[${i}].location`, poolName);
                      }}
                    />
                  </TableCell>
                  <TableCell data-heading="Tags">
                    <TagNameField
                      label={null}
                      name={`disks[${i}].tags`}
                      placeholder="Add tags"
                    />
                  </TableCell>
                  <TableCell className="u-align-non-field" data-heading="Boot">
                    <FormikField
                      aria-label="Boot"
                      checked={bootDisk === disk.id}
                      labelClassName="p-radio--inline u-nudge-right--small"
                      name="bootDisk"
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        handleChange(e);
                        setFieldValue("bootDisk", disk.id);
                      }}
                      type="radio"
                    />
                  </TableCell>
                  <TableCell
                    className="u-align--right u-no-padding--right u-align-non-field"
                    data-heading="Actions"
                  >
                    <TableActions
                      data-testid="remove-disk"
                      deleteDisabled={
                        disks.length === 1 || !!composingPods.length
                      }
                      deleteTooltip={
                        disks.length === 1
                          ? "At least one disk is required."
                          : null
                      }
                      onDelete={() => removeDisk(disk.id)}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
        <Button
          className="u-hide--small"
          data-testid="add-disk"
          disabled={disabled}
          hasIcon
          onClick={addDisk}
          type="button"
        >
          <i className="p-icon--plus"></i>
          <span>Add disk</span>
        </Button>
      </>
    );
  }
  return <Spinner text="Loading..." />;
};

export default StorageTable;
