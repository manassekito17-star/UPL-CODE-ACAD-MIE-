import { useLocalSearchParams } from 'expo-router';

import { EditorScreen } from '@/screens/editor/EditorScreen';

export default function EditorRoute() {
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  return <EditorScreen projectId={projectId} />;
}
