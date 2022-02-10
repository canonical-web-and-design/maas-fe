import "@testing-library/react";
import "@testing-library/jest-dom";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import Enzyme from "enzyme";
import { enableFetchMocks } from "jest-fetch-mock";

Enzyme.configure({ adapter: new Adapter() });

enableFetchMocks();
