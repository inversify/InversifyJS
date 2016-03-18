interface IContext {

        /// Gets the kernel that is driving the resolution.
        kernel: IKernel;

        /// Gets or sets the resolution plan.
        plan: IPlan;

        addPlan(plan: IPlan): void;
}
