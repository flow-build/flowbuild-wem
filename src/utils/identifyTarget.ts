import { Blueprint, Node } from '@/types'

const identifyTarget = (blueprint_spec: Blueprint) => {
  try {
    const { nodes } = blueprint_spec
    const startNode = nodes.find(
      (node) => node.type.toLowerCase() === 'start'
    ) as Node
    const { parameters } = startNode
    if (parameters.events && parameters.events.length) {
      const targetEvent = parameters.events.find(
        (ev) => ev.category === 'signal' && ev.family === 'target'
      )
      if (targetEvent) {
        return [true, targetEvent]
      }
    }
    return [false]
  } catch (e) {
    console.log('Error: ', e)
    return [false]
  }
}

export { identifyTarget }
