export { default as DynamicFolderPreview } from './DynamicFolderPreview.svelte';

export interface FolderItem {
  id: string;
  color?: string;
  icon?: any;
  name: string;
}

export interface FolderConfig {
  items: FolderItem[];
  type: 'integrations' | 'tables';
}
