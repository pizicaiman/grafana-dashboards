import React, { FC, useCallback, useState } from 'react';
import { Button, HorizontalGroup, useStyles } from '@grafana/ui';
import { TextInputField, TextareaInputField, validators } from '@percona/platform-core';
import { Table } from 'shared/components/Elements/Table/Table';
import { Messages } from 'pmm-dbaas/DBaaS.messages';
import { Form, FormRenderProps } from 'react-final-form';
import { Modal } from 'shared/components/Elements/Modal/Modal';
import { getStyles } from './Kubernetes.styles';
import { Kubernetes, NewKubernetesCluster, KubernetesProps } from './Kubernetes.types';
import { AddClusterButton } from '../AddClusterButton/AddClusterButton';
import { OperatorStatusItem } from './OperatorStatusItem/OperatorStatusItem';
import { KubernetesClusterStatus } from './KubernetesClusterStatus/KubernetesClusterStatus';
import { CheckboxField, FormElement } from 'shared/components/Form';
import { DATABASE_LABELS, Databases } from 'shared/core';

export const KubernetesInventory: FC<KubernetesProps> = ({
  kubernetes,
  deleteKubernetes,
  addKubernetes,
  loading,
}) => {
  const styles = useStyles(getStyles);
  const [kubernetesToDelete, setKubernetesToDelete] = useState<Kubernetes>({ kubernetesClusterName: '' });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const { required } = validators;
  const columns = [
    {
      Header: Messages.kubernetes.table.nameColumn,
      accessor: 'kubernetesClusterName',
    },
    {
      Header: 'Kubernetes cluster status',
      accessor: (element) => (
        <KubernetesClusterStatus status={element.status} />
      ),
    },
    {
      Header: 'Operators status',
      accessor: (element) => (
        <div>
          <OperatorStatusItem databaseType={Databases.mysql} status={element.operators.xtradb.status} />
          <OperatorStatusItem databaseType={Databases.mongodb} status={element.operators.psmdb.status} />
        </div>
      ),
    },
    {
      Header: Messages.kubernetes.table.actionsColumn,
      accessor: (element) => (
        <div className={styles.actionsColumn}>
          <Button
            size="md"
            onClick={() => {
              setKubernetesToDelete(element);
              setDeleteModalVisible(true);
            }}
            icon="trash-alt"
            variant="destructive"
            data-qa="open-delete-modal-button"
          >
            {Messages.kubernetes.deleteAction}
          </Button>
        </div>
      ),
    },
  ];

  const AddNewClusterButton = useCallback(
    () => (
      <AddClusterButton
        label={Messages.kubernetes.addAction}
        action={() => setAddModalVisible(!addModalVisible)}
        data-qa="kubernetes-new-cluster-button"
      />
    ),
    [addModalVisible],
  );

  return (
    <div className={styles.tableWrapper}>
      <div className={styles.actionPanel}>
        <AddNewClusterButton />
      </div>
      <Modal
        title={Messages.kubernetes.addModal.title}
        isVisible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
      >
        <Form
          onSubmit={(values: NewKubernetesCluster) => {
            addKubernetes(values);
            setAddModalVisible(false);
          }}
          render={({ handleSubmit, valid, pristine }: FormRenderProps<NewKubernetesCluster>) => (
            <form onSubmit={handleSubmit}>
              <>
                <TextInputField
                  name="name"
                  label={Messages.kubernetes.addModal.fields.clusterName}
                  validators={[required]}
                />
                <TextareaInputField
                  name="kubeConfig"
                  label={Messages.kubernetes.addModal.fields.kubeConfig}
                  validators={[required]}
                />

                <HorizontalGroup justify="center" spacing="md">
                  <Button
                    data-qa="kubernetes-add-cluster-button"
                    size="md"
                    variant="primary"
                    disabled={!valid || pristine}
                  >
                    {Messages.kubernetes.addModal.confirm}
                  </Button>
                </HorizontalGroup>
              </>
            </form>
          )}
        />
      </Modal>
      <Modal
        title={Messages.kubernetes.deleteModal.title}
        isVisible={deleteModalVisible}
        onClose={() => setDeleteModalVisible(false)}
      >
        <Form
          onSubmit={() => {}}
          render={({ form, handleSubmit }) => (
            <form onSubmit={handleSubmit}>
              <>
                <h4 className={styles.deleteModalContent}>
                  {Messages.kubernetes.deleteModal.confirmMessage}
                </h4>
                <FormElement
                  dataQa="form-field-force"
                  label={Messages.kubernetes.deleteModal.labels.forceWrapper}
                  element={
                    <CheckboxField name="force" label={Messages.kubernetes.deleteModal.labels.force} />
                  }
                />
                <HorizontalGroup justify="space-between" spacing="md">
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => setDeleteModalVisible(false)}
                    data-qa="cancel-delete-kubernetes-button"
                  >
                    {Messages.kubernetes.deleteModal.cancel}
                  </Button>
                  <Button
                    variant="destructive"
                    size="md"
                    onClick={() => {
                      deleteKubernetes(kubernetesToDelete, Boolean(form.getState().values.force));
                      setDeleteModalVisible(false);
                    }}
                    data-qa="delete-kubernetes-button"
                  >
                    {Messages.kubernetes.deleteModal.confirm}
                  </Button>
                </HorizontalGroup>
              </>
            </form>
          )}
        />
      </Modal>
      <Table columns={columns} data={kubernetes} loading={loading} noData={<AddNewClusterButton />} />
    </div>
  );
};
