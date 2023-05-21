//Set us up to be able to read wgsl files
declare module "*.wgsl" {
	const value: string;
	export default value;
}