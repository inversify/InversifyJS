import { ConfigurableBindingScopeEnum, ContextHierarchyOptionEnum } from "../constants/literal_types";
import { interfaces } from "../interfaces/interfaces";
import { getBindingDictionary } from "../planning/planner";
import { Stack } from "./stack";

export class ContextStack {
  constructor(private readonly container:interfaces.Container){}
  private _contextStack:interfaces.Stack<interfaces.Context> = new Stack<interfaces.Context>();
  private _contextStackDepth = 0;
  private _requiresContextStack = false;
  planCompleted(context:interfaces.Context):void {
    this._contextStackDepth++;
    if(this._contextStackDepth === 1) {
        this._determineRequiresContextHierarchy();
    }
    if (this._requiresContextStack) {
        context.parentContext = this._contextStack.peek();
        this._contextStack.push(context);
    }
  }
  resolved():void {
    this._contextStackDepth--;
    this._contextStack.pop();
  }

  inRootRequestScope(context:interfaces.Context) {
    this._contextStack.push(context);
  }

  private _determineRequiresContextHierarchy(): void {
    let requiresContextHierarchyOption: interfaces.ContextHierarchyOption = ContextHierarchyOptionEnum.Allow;
    if(this.container.options.contextHierarchy !== undefined){
        requiresContextHierarchyOption = this.container.options.contextHierarchy;
    }

    this._requiresContextStack = false;

    if(requiresContextHierarchyOption === ContextHierarchyOptionEnum.Disallow) {
      return;
    }
    if (requiresContextHierarchyOption === ContextHierarchyOptionEnum.Allow) {
        this._requiresContextStack = true;
        return;
    }

    let container:interfaces.Container | null = this.container;
    while (container) {
        const bindingDictionary = getBindingDictionary(container);
        const bindingMapEntries = bindingDictionary.getMap().entries();
        let bindingMapEntry = bindingMapEntries.next();

        while (!bindingMapEntry.done) {
            const bindings = bindingMapEntry.value[1];
            for(const binding of bindings){
                const scope = binding.scope;
                if(scope.type === ConfigurableBindingScopeEnum.Custom || scope.type === ConfigurableBindingScopeEnum.RootRequest){
                    this._requiresContextStack = true;
                    return;
                }
            }
            bindingMapEntry = bindingMapEntries.next();
        }
        container = container.parent;
    }
  }
}