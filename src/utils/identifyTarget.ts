import { Blueprint, Node } from '@/types'

const identifyTarget = (blueprint_spec: Blueprint) => {
  try {
    const { nodes } = blueprint_spec
    const startNode = nodes.find(
      (node) => node.type.toLowerCase() === 'start'
    ) as Node
    const { parameters } = startNode
    if (parameters && parameters.target) {
      return [true, parameters.target]
    }
    return [false]
  } catch (e) {
    console.log('Error: ', e)
    return [false]
  }
}

export { identifyTarget }
