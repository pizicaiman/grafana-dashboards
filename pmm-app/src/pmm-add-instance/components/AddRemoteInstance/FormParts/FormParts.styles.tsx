import { stylesFactory } from '@grafana/ui';
import { css } from 'emotion';

export const getStyles = stylesFactory(() => ({
  groupWrapper: css`
    width: 50%;
  `,
  addServiceButton: css`
    margin-top: 30px;
  `,
  sectionHeader: css`
    margin-top: 15px;
    margin-bottom: 15px;
  `,
}));
