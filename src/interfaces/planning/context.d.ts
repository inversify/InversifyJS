interface IContext {

        /// Gets the kernel that is driving the activation.
        kernel: IKernel;

        /// Gets or sets the activation plan.
        plan: IPlan;

        addPlan(plan: IPlan): void;
}
