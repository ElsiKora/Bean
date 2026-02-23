import type { ReadStream, WriteStream } from "node:tty";

import type { IBeanOptionsInterface } from "@presentation/interface/bean/bean-options.interface";

export interface IBeanFactoryOptionsInterface extends IBeanOptionsInterface {
	stdin?: ReadStream;
	stdout?: WriteStream;
}
