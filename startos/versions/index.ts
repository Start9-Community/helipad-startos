import { VersionGraph } from '@start9labs/start-sdk'
import { current } from './current'
import { v_0_2_2_8 } from './v0.2.2_8'

export const versionGraph = VersionGraph.of({
  current,
  other: [v_0_2_2_8],
})
