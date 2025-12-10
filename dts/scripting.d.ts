/**
 * scripting v1.1.1
 * Copyright (c) 2024-present Thom Fang <tilfon@live.com>
 * All rights reserved.
 */

type IdProps = {
    /**
     * Use a unique key for a widget.
     */
    key?: string | number;
};
type InternalWidgetRender<P = {}> = (props: P) => RenderNode;
type RenderNode = {
    isInternal: boolean;
    type?: string;
    id?: string;
    cpId?: string;
    props?: any;
    modifiers?: Record<string, any>[] | null;
    observables?: Observable<any>[];
    children?: any | null;
} & IdProps;
type ComponentProps<T = {}> = T & IdProps & {
    children?: VirtualNode | string | number | boolean | undefined | null | Array<string | number | boolean | undefined | null | VirtualNode>;
};
type VirtualNode = IdProps & {
    isInternal: boolean;
    props: ComponentProps<any>;
    render: FunctionComponent<any> | InternalWidgetRender;
};
type FunctionComponent<P = {}> = (props: P) => VirtualNode;
type SetStateAction<S> = S | ((preState: S) => S);
type StateInitializer<S> = () => S;
type EffectDestructor = () => void;
type EffectSetup = () => EffectDestructor | void | undefined;
type ComponentEffect = [any[], EffectSetup, boolean, ReturnType<EffectSetup>];
type ComponentEffectEvent<T extends any[], R> = (...args: T) => R;
type ComponentCallback<T extends Function> = [T, any[]];
type ComponentMemo = [any, any[]];
type Reducer<S, A> = (preState: S, action: A) => S;
type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
type Dispatch<A> = (action: A) => void;

/**
 * An adaptive background view that provides a standard appearance based on the the widget’s environment.
 */
declare const AccessoryWidgetBackground: FunctionComponent<{}>;

/**
 * `useCallback` is a React Hook that lets you cache a function definition between re-renders.
 *  You can’t call it inside loops or conditions. If you need that, extract a new component and move the state into it.
 *
 *
 * @example
 * ```tsx
 * function App() {
 *   const [count, setCount] = useState(0)
 *   const onButtonClicked = useCallback(() => {
 *     setCount(count => count + 1)
 *   }, [])
 *
 *   return (
 *     <VStack>
 *       <Text>{count}</Text>
 *       <MyButton
 *         onClick={onButtonClicked}
 *       />
 *     </VStack>
 *   )
 * }
 *
 * // This component would not render any more after first render.
 * function MyButton({onClick}: {onClick: () => void}) {
 *   return (
 *     <Button title="Click" action={onClick} />
 *   )
 * }
 * ```
 */
declare function useCallback<T extends Function>(func: T, deps: any[]): T;

type ProviderProps<T> = {
    value: T;
    children: VirtualNode;
};
type ConsumerProps<T> = {
    children: (value: T) => VirtualNode;
};
type Provider<T> = (props: ProviderProps<T>) => VirtualNode;
type Consumer<T> = (props: ConsumerProps<T>) => VirtualNode;
/**
 * Passing Data Deeply with Context.
 */
type Context<T> = {
    readonly id: number;
    readonly Provider: Provider<T>;
    readonly Consumer: Consumer<T>;
    debugLabel?: string;
};
/**
 * Create a data context.
 *
 * @returns `Context` object
 *
 * @example
 * ```tsx
 * import { Color, createContext, Navigation, useColorScheme } from 'scripting'
 *
 * type ThemeData = {
 *   labelColor: Color
 * }
 * const lightTheme: ThemeData = {
 *   labelColor: '#000000'
 * }
 * const darkTheme: ThemeData = {
 *   labelColor: '#FFFFFF'
 * }
 *
 * const ThemeDataContext = createContext<ThemeData>()
 *
 * function ThemeDataProvider({
 *   children
 * }: {
 *   children: JSX.Element
 * }) {
 *   const colorScheme = useColorScheme()
 *   const themeData = colorScheme == 'dark' ? darkTheme : lightTheme
 *
 *   return (
 *     <ThemeDataContext.Provider value={themeData}>
 *       {children}
 *     </ThemeDataContext.Provider>
 *   )
 * }
 *
 * function View() {
 *   const theme = useContext(ThemeDataContext)
 *
 *   return <Text color={theme.labelColor}>Hello world!</Text>
 * }
 *
 * Navigation.present({
 *   element: (
 *     <ThemeDataProvider>
 *       <View />
 *     </ThemeDataProvider>
 *   )
 * })
 * ```
 */
declare function createContext<T>(): Context<T>;

/**
 * `useContext` is a Hook that lets you read and subscribe to context from your component.
 *
 * @example
 * ```tsx
 * const MyContext = createContext<{
 *   value: string
 * }>()
 *
 * function Provider({children}: {children: JSX.Element}) {
 *   return (
 *     <MyContext.Provider value={{
 *       value: 'some value here'
 *     }}>
 *     {children}
 *     </MyContext.Provider>
 *   )
 * }
 *
 * function View() {
 *   const {value} = useContext(MyContext)
 *   return (
 *     <Text>{value}</Text>
 *   )
 * }
 *
 * Navigation.present({
 *   element: (
 *     <Provider>
 *       <View/>
 *     </Provider>
 *   )
 * })
 * ```
 */
declare function useContext<T>(context: Context<T>): T;
/**
 * `useSelector` is a Hook that lets you read and subscribe to a prop of context from your component.
 *
 * @example
 * ```tsx
 * const UserContext = createContext<{
 *   name: string
 *   age: number
 *   sex: 'male' | 'female'
 * }>()
 *
 * function Provider({children}: {children: JSX.Element}) {
 *   return (
 *     <UserContext.Provider value={{
 *       name: 'Jerry',
 *       age: 8,
 *       sex: 'female'
 *     }}>
 *     {children}
 *     </UserContext.Provider>
 *   )
 * }
 *
 * function View() {
 *   const name = useSelector(UserContext, context => context.name)
 *   return (
 *     <Text>{name}</Text>
 *   )
 * }
 *
 * Navigation.present({
 *   element: (
 *     <Provider>
 *       <View/>
 *     </Provider>
 *   )
 * })
 * ```
 */
declare function useSelector<T, R>(context: Context<T>, selector: (context: T) => R): R;

/**
 * `useEffect` is a Hook that lets you synchronize a component with an external system.
 *
 *
 * @example
 * ```tsx
 * function ChartRoom({roomId}: {roomId: string}) {
 *   const [messages, setMessages] = useState<string[]>([])
 *
 *   useEffect(() => {
 *     // this setup function runs when your component is added to the page (mounts).
 *
 *     const listener: (message: string) => {
 *       setMessages(list => [message, ...list])
 *     }
 *     subscribeChatMessage(listener)
 *
 *     // return a cleanup function
 *     return () => {
 *       // this function would be called when `roomId` is changed or the component is disposed.
 *       unsubscribeChatMessage(listener)
 *     }
 *   }, [roomId])
 * }
 * ```
 */
declare function useEffect(setup: EffectSetup, deps: any[]): void;

/**
 * `useMemo` is a Hook that lets you cache the result of a calculation between re-renders.
 * Call useMemo at the top level of your component to cache a calculation between re-renders:
 *
 * `calculateValue`: The function calculating the value that you want to cache.
 * It should be pure, should take no arguments, and should return a value of any type.
 * This function would be called during the initial render. On next renders, would
 * return the same value again if the dependencies have not changed since the last render.
 * Otherwise, it will call calculateValue, return its result, and store it so it can be
 * reused later.
 *
 * `deps`: The list of all reactive values referenced inside of the calculateValue code.
 * Reactive values include props, state, and all the variables and functions declared
 * directly inside your component body. The list of dependencies must have a constant number of items and be written inline like `[dep1, dep2, dep3]`.
 * Will compare each dependency with its previous value using the `Object.is` comparison.
 *
 *
 * @example
 * ```tsx
 * type Item = {time: number}
 * function View({list}: {list: Item[]}) {
 *   const [filterTime, setFilterTime] = useState(Date.now())
 *   const visibleItems = useMemo(() => {
 *      return list.filter(item => item.time <= filterTime)
 *   }, [list, filterTime])
 *
 *   return (
 *     <List
 *       itemCount={visibleItems.length}
 *       itemBuilder={index => (
 *          <YourListItemView item={visibleItems[index]} />
 *       )}
 *     >
 *      <ForEach count={visibleItems.length}
 *        itemBuilder={index => (
 *          <YourListItemView item={visibleItems[index]} />
 *        )}
 *      />
 *     </List>
 *   )
 * }
 * ```
 */
declare function useMemo<T>(calculateValue: () => T, deps: any[]): T;

/**
 * `useReducer` is a Hook that lets you add a reducer to your component.
 * Call `useReducer` at the top level of your component to manage its state with a reducer.
 *
 * The `reducer` function that specifies how the state gets updated. It must be pure,
 * should take the state and action as arguments, and should return the next state. State and action can be of any types.
 *
 * The value from which the `initialState` is calculated. It can be a value of any type.
 * How the initial state is calculated from it depends on the next init argument.
 *
 * The `initializer` function that should return the initial state. If it’s not specified,
 * the initial state is set to `initialArg`. Otherwise, the initial state is set to the
 * result of calling `initializer(initialArg)`.
 *
 * `useReducer` returns an array with exactly two items:
 *   - The `current state` of this state variable, initially set to the initial state you provided.
 *   - The `dispatch function` that lets you change it in response to interaction.
 *
 * To update what’s on the screen, call dispatch with an object representing what the user did, called an action.
 *
 *
 * @example
 * ```tsx
 * type State = {
 *   username: string
 *   password: string
 * }
 * type UpdateUsernameAction = {
 *   type: 'updateUsername'
 *   payload: string
 * }
 * type UpdatePasswordAction = {
 *   type: 'updatePassword'
 *   payload: string
 * }
 * type Action = UpdateUsernameAction | UpdatePasswordAction
 * function Reducer(state: State, action: Action): State {
 *   switch (action.type) {
 *     case 'updateUsername':
 *       return { ...state, username: action.payload }
 *     case 'updatePassword':
 *       return { ...state, password: action.payload }
 *   }
 * }
 * const initialState: State = {
 *   username: '',
 *   password: '',
 * }
 *
 * function FormView() {
 *   const [state, dispatch] = useReducer(Reducer, initialState)
 *
 *   function updateUsername(value: string) {
 *     dispatch({
 *       type: 'updateUsername',
 *       payload: value,
 *     })
 *   }
 *
 *   function updatePassword(value: string) {
 *     dispatch({
 *       type: 'updatePassword',
 *       payload: value,
 *     })
 *   }
 *
 *   return (
 *     <Form>
 *       <TextField
 *         prompt="User Name"
 *         value={state.username}
 *         onChanged={updateUsername}
 *       />
 *       <TextField
 *         prompt="Password"
 *         value={state.password}
 *         onChanged={updatePassword}
 *       />
 *     </From>
 *   )
 * }
 * ```
 */
declare function useReducer<R extends Reducer<any, any>, I>(reducer: R, initializerArg: I & ReducerState<R>, initializer: (arg: I & ReducerState<R>) => ReducerState<R>): [ReducerState<R>, Dispatch<ReducerAction<R>>];
declare function useReducer<R extends Reducer<any, any>>(reducer: R, initialState: ReducerState<R>, initializer?: undefined): [ReducerState<R>, Dispatch<ReducerAction<R>>];

/**
 * `useState` is a Hook that lets you add a state variable to your component.
 * Call `useState` at the top level of your component to declare a state variable.
 *
 * `useState` returns an array with exactly two values:
 *   - The current state. During the first render, it will match the initialState you have passed.
 *   - The set function that lets you update the state to a different value and trigger a re-render.
 *
 *
 * @example
 * ```tsx
 * function App() {
 *   const [count, setCount] = useState()
 *
 *   // The `setCount` function returned by useState lets you update the state to a different value
 *   // and trigger a re-render. You can pass the next state directly, or a function that
 *   // calculates it from the previous state:
 *   function handlePlus() {
 *      setCount(count + 1)
 *   }
 *   function handleMinus() {
 *      setCount(count => count - 1)
 *   }
 *
 *   return (
 *     <HStack>
 *       <Button title="Minus" action={handleMinus} />
 *       <Text>{count}</Text>
 *       <Button title="Plus" action={handlePlus}>
 *     </HStack>
 *   )
 * }
 * ```
 */
declare function useState<T = undefined>(): [T | undefined, (state: SetStateAction<T | undefined>) => void];
declare function useState<T>(value: T | StateInitializer<T>): [T, (state: SetStateAction<T>) => void];

/**
 *
 */
declare function useEffectEvent<T extends any[], R>(callback: ComponentEffectEvent<T, R>): ComponentEffectEvent<T, R>;

/**
 * Creates an observable value that is **guaranteed to be non-null**.
 *
 * This hook returns an `Observable<T>` instance whose `value` can only be
 * updated to the same non-null type `T`. It synchronizes with the UI: whenever
 * `setValue` is called, the component re-renders automatically.
 *
 * This hook is suitable when the value must always exist (e.g. text fields,
 * counters, toggles with a defined default state).
 *
 * @typeParam T - The type of the observable value. Must be one of: string, number, boolean, Date, or any[].
 *
 * @param initialValue - The initial value or an initializer function returning the initial value.
 *                       The value must not be `null` or `undefined`.
 *
 * @returns An object containing:
 * - `value`: the current value of type `T`
 * - `setValue(newValue: T)`: updates the value and triggers UI updates
 *
 * @throws If called outside of a component render function.
 *
 * @example
 * // Basic usage: counter
 * const count = useObservable(0)
 * count.value           // 0
 * count.setValue(5)     // ✅ OK
 * count.setValue(null)  // ❌ Type error, null not allowed
 *
 * @example
 * // Using initializer function (lazy initialization)
 * const name = useObservable(() => 'Tom')
 * name.value            // "Tom"
 *
 * @example
 * // With literal type widening
 * const status = useObservable('loading')
 * // status.value: string
 * status.setValue('done')  // ✅ allowed
 */
declare function useObservable<T = undefined>(): Observable<T | undefined>;
declare function useObservable<T>(value: T | StateInitializer<T>): Observable<T>;

type RefObject<T> = {
    readonly current: T | null;
};
type MutableRefObject<T> = {
    current: T;
};
/**
 * `useRef` is a Hook that lets you reference a value that’s not needed for rendering.
 *
 * @example
 * ```tsx
 * function App() {
 *   const [count, setCount] = useState(0)
 *   const timerIdRef = useRef<number>() // MutableRefObject
 *
 *   useEffect(() => {
 *     function startTimer() {
 *       timerIdRef.current = setTimeout(() => {
 *         startTimer()
 *         setCount(count => count + 1)
 *       }, 1000)
 *     }
 *     return () => {
 *       if (timerIdRef.current != null) {
 *          clearTimeout(timerIdRef.current)
 *       }
 *     }
 *   }, [])
 *
 *   return (
 *     <Text>{count}</Text>
 *   )
 * }
 * ```
 */
declare function useRef<T>(initialValue: T): MutableRefObject<T>;
declare function useRef<T>(initialValue: T | null): RefObject<T>;
declare function useRef<T = undefined>(): MutableRefObject<T | undefined>;

declare function createElement<P = {}>(type: FunctionComponent<P>, props: ComponentProps<P>, ...children: VirtualNode[]): VirtualNode;
type CreateElementFunc = typeof createElement;
declare global {
    const createElement: CreateElementFunc;
    const Fragment: FunctionComponent<any>;
}

type AnimatedFramesProps = {
    /**
     * The animation duration, in seconds.
     */
    duration: DurationInSeconds;
    /**
     * The array of views to toggle as the frames of the animation. Each child will be displayed sequentially during the animation.
     */
    children: VirtualNode[];
};
/**
 * A view allows you to display a frame animation in a widget by cycling through the provided child views as frames. The duration of the animation is customizable, and each frame corresponds to a view passed in as a child element.
 * @example
 * ```tsx
 * <AnimatedFrames
 *   duration={4}
 * >
 *   <Circle
 *     fill="red"
 *     frame={{
 *       width: 20,
 *       height: 20,
 *     }}
 *   />
 *   <Circle
 *     fill="red"
 *     frame={{
 *       width: 25,
 *       height: 25,
 *     }}
 *   />
 *   <Circle
 *     fill="red"
 *     frame={{
 *       width: 30,
 *       height: 30,
 *     }}
 *   />
 *   <Circle
 *     fill="red"
 *     frame={{
 *       width: 35,
 *       height: 35,
 *     }}
 *   />
 * </AnimatedFrames>
 * ```
 */
declare const AnimatedFrames: FunctionComponent<AnimatedFramesProps>;

type AnimatedGifProps = {
    /**
     * The file path of the GIF image.
     */
    path: string;
    /**
     * The animation duration in seconds. If not provided, the default duration of the GIF is used.
     */
    duration?: DurationInSeconds;
};
/**
 * This views renders an animated GIF in a widget. You can provide a custom path to the GIF file, and optionally, a duration for the animation.
 * @example
 * ```tsx
 * <AnimatedFrame
 *   path={
 *     Path.join(
 *       Script.directory,
 *       "test.gif"
 *     )
 *   }
 *   duration={4}
 * />
 * ```
 */
declare const AnimatedGif: FunctionComponent<AnimatedGifProps>;

/**
 * Duration in milliseconds, one second is `1000`.
 */
type DurationInMilliseconds = number;
/**
 * Constants that define how a view’s content fills the available space.
 */
type ContentMode = 'fit' | 'fill';
/**
 * The horizontal or vertical dimension in a 2D coordinate system.
 */
type Axis = 'vertical' | 'horizontal';
/**
 * An efficient set of axes.
 */
type AxisSet = 'vertical' | 'horizontal' | 'all';
type ColorScheme = 'light' | 'dark';
type ColorSchemeContrast = "standard" | "increased";
type UserInterfaceSizeClass = "compact" | "regular";
type Visibility = 'automatic' | 'hidden' | 'visible';
/**
 * A geometric angle whose value you access in either radians or degrees.
 */
type Angle = {
    type: 'degrees' | 'radians';
    value: number;
};
type KeywordPoint = 'top' | 'topLeading' | 'topTrailing' | 'bottom' | 'bottomLeading' | 'bottomTrailing' | 'leading' | 'trailing' | 'center' | 'zero';
/**
 * A rectangular shape with rounded corners with different values, aligned inside the frame of the view containing it.
 */
type RectCornerRadii = {
    topLeading?: number;
    bottomLeading?: number;
    bottomTrailing?: number;
    topTrailing?: number;
};
type EdgeInsets = {
    top: number;
    leading: number;
    bottom: number;
    trailing: number;
};
type Edge = 'top' | 'leading' | 'trailing' | 'bottom';
type EdgeSetOption = 'top' | 'leading' | 'trailing' | 'bottom' | 'horizontal' | 'vertical';
type EdgeSet = 'all' | EdgeSetOption | EdgeSetOption[];
type VerticalEdge = 'top' | 'bottom';
type VerticalEdgeSet = 'all' | VerticalEdge;
type HorizontalEdge = 'leading' | 'trailing';
type HorizontalEdgeSet = 'all' | HorizontalEdge;
/**
 * Defines the shape of a rounded rectangle’s corners.
 *  - `circular`: Quarter-circle rounded rect corners.
 *  - `continuous`: Continuous curvature rounded rect corners.
 */
type RoundedCornerStyle = 'circular' | 'continuous';
type Point = {
    x: number;
    y: number;
};
type Size = {
    width: number;
    height: number;
};
/**
 * Use horizontal alignment guides to tell view how to position views relative to one another horizontally, like when you place views vertically in an VStack. The following example demonstrates common built-in horizontal alignments:
 * ![Horizontal Alignment](https://docs-assets.developer.apple.com/published/cb8ad6030a1ebcfee545d02f406500ee/HorizontalAlignment-1-iOS@2x.png)
 */
type HorizontalAlignment = 'leading' | 'center' | 'trailing';
/**
 * Use vertical alignment guides to position views relative to one another vertically, like when you place views side-by-side in an HStack . The following example demonstrates common built-in vertical alignments:
 * ![Vertical Alignment](https://docs-assets.developer.apple.com/published/a63aa800a94319cd283176a8b21bb7af/VerticalAlignment-1-iOS@2x.png)
 */
type VerticalAlignment = "top" | "center" | "bottom" | "firstTextBaseline" | "lastTextBaseline";
/**
 * A background material type.
 *  - `ultraThinMaterial`: A mostly translucent material.
 *  - `thinMaterial`: A material that’s more translucent than opaque.
 *  - `regularMaterial`: A material that’s somewhat translucent.
 *  - `thickMaterial`: A material that’s more opaque than translucent.
 *  - `ultraThickMaterial`: A mostly opaque material.
 *  - `barMaterial`: A material matching the style of system toolbars.
 */
type Material = "barMaterial" | "regularMaterial" | "thinMaterial" | "thickMaterial" | 'ultraThickMaterial' | 'ultraThinMaterial';
type StrokeStyle = {
    lineWidth?: number;
    lineCap?: 'butt' | 'round' | 'square';
    lineJoin?: 'bevel' | 'miter' | 'round';
    mitterLimit?: number;
    dash?: number[];
    dashPhase?: number;
};
type ImageScale = 'large' | 'medium' | 'small';
/**
 * The modes that view uses to resize an image to fit within its containing view.
 */
type ImageResizingMode = 'tile' | 'stretch';
/**
 * A set of alignments that represent common combinations of the built-in horizontal and vertical alignment guides. The blue boxes in the following diagram demonstrate the alignment named by each box’s label, relative to the background view:
 * ![Alignment](https://docs-assets.developer.apple.com/published/09693fd98ab76356519a900fd33d9e7f/Alignment-1-iOS@2x.png)
 */
type Alignment = "top" | "center" | "bottom" | "leading" | "trailing" | "bottomLeading" | "bottomTrailing" | "centerFirstTextBaseline" | "centerLastTextBaseline" | "leadingFirstTextBaseline" | "leadingLastTextBaseline" | "topLeading" | "topTrailing" | "trailingFirstTextBaseline" | "trailingLastTextBaseline";
/**
 * The pattern, that the line has.
 */
type LineStylePattern = 'solid' | 'dash' | 'dashDot' | 'dashDotDot' | 'dot';
type SafeAreaRegions = 'all' | 'container' | 'keyboard';
/**
 * An individual dimension representing a mark’s width or height.
 *  - `automatic`: A dimension that determines its value automatically.
 *  - Others:
 *    - `inset`: A dimension that’s the step size minus the specified inset value on each side. `value`: The given inset value in screen coordinates.
 *    - `fixed`: A constant dimension. `value`: The fixed width or height.
 *    - `ratio`: A dimension that’s proportional to the scale step size, using the specified ratio. `value`: The given ratio, from 0 to 1.
 */
type MarkDimension = "automatic" | {
    type: 'inset' | 'ratio' | 'fixed';
    value: number;
};
/**
 * The size types, like regular or small, that you can apply to controls within a view.
 */
type ControlSize = 'mini' | 'small' | 'regular' | 'large' | 'extraLarge';
/**
 * The rendering modes for widgets.
 *  - `accented`: A widget that uses the accent color.
 *  - `fullColor`: A widget that uses the specified color.
 *  - `vibrant`: A widget that uses the system color.
 */
type WidgetRenderingMode = "accented" | "fullColor" | "vibrant";

type AnimatedImageProps = ({
    /**
     * An array of SFSymbol names and variable values to display as a sequence of animated images.
     */
    systemImages: (string | {
        name: string;
        variableValue: number;
    })[];
} | {
    /**
     * An array of UIImage objects to use as the animated frames.
     */
    images: UIImage[];
}) & {
    /**
     * A flag indicating whether this view should fit or fill the parent context. Defaults to "fit".
     */
    contentMode?: ContentMode;
    /**
     * The animation duration, in seconds.
     */
    duration: DurationInSeconds;
};
/**
 * The AnimatedImage component renders an animated image in a widget. You can display either SFSymbol images or UIImage objects. The animation duration and content mode (fit or fill) can be customized.
 * @example
 * ```tsx
 * // SFSymbol
 * <AnimatedImage
 *   duration={6}
 *   systemImages={[
 *     {name: "chart.bar.fill", variableValue: 0},
 *     {name: "chart.bar.fill", variableValue: 0.3},
 *     {name: "chart.bar.fill", variableValue: 0.6},
 *     {name: "chart.bar.fill", variableValue: 1},
 *   ]}
 *   contentMode="fit"
 * />
 *
 * // UIImage
 * const image1 = Path.join(Script.directory, "image1.png")
 * const image2 = Path.join(Script.directory, "image2.png")
 *
 * <AnimatedImage
 *   duration={4}
 *   images={[
 *     UIImage.fromFile(image1),
 *     UIImage.fromFile(image2),
 *   ]}
 *   contentMode="fill"
 * />
 * ```
 */
declare const AnimatedImage: FunctionComponent<AnimatedImageProps>;

type AppIntent<T, R, P> = {
    script: string;
    name: string;
    protocol: P;
    params: T;
};
type AppIntentFactory<T, R, P = AppIntentProtocol> = (params: T) => AppIntent<T, R, P>;
type AppIntentPerform<T, R = void> = (params: T) => Promise<R>;
declare enum AppIntentProtocol {
    AppIntent = 0,
    /**
     * An App Intent that plays, pauses, or otherwise modifies audio playback state when it executes.
     */
    AudioPlaybackIntent = 1,
    /**
     * An app intent that starts, stops or otherwise modifies audio recording state. (Available on iOS 18.0+)
     *
     * In iOS and iPadOS, When you adopt the AudioRecordingIntent protocol, you must start a Live Activity when you begin the audio recording and keep it active as long as you record audio. If you don’t start a Live Activity, the audio recording stops.
     */
    AudioRecordingIntent = 2,
    /**
     * An intent that starts, pauses, or otherwise modifies a Live Activity when it runs.
     */
    LiveActivityIntent = 3,
    /**
     * An intent that returns a snippet when it runs.
     */
    SnippetIntent = 4
}
/**
 * Use this interface to register a specified protocol AppIntent, and this AppIntent could be use for `Button` and `Toggle` controls in `Widget` or `LiveActivity`.
 */
declare class AppIntentManager {
    /**
     * Register an AppIntent with specified protocol. Provides a unique `name` for the AppIntent, the `perform` function will be call when an action trigger by a control view.
     * @returns An AppIntent factory function.
     */
    static register<T, R = void>(options: {
        name: string;
        protocol: AppIntentProtocol.AppIntent | AppIntentProtocol.AudioPlaybackIntent | AppIntentProtocol.AudioRecordingIntent | AppIntentProtocol.LiveActivityIntent;
        perform: AppIntentPerform<T, R>;
    }): AppIntentFactory<T, R>;
    static register<T>(options: {
        name: string;
        protocol: AppIntentProtocol.SnippetIntent;
        perform: AppIntentPerform<T, VirtualNode>;
    }): AppIntentFactory<T, RangeError, AppIntentProtocol.SnippetIntent>;
    private static perform;
}

type ButtonRole = 'destructive' | 'cancel' | 'close' | 'confirm';
type ButtonProps = ({
    title: string;
    systemImage?: string;
    children?: never;
} | {
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
    title?: never;
    systemImage?: never;
}) & {
    /**
     * A value that describes the purpose of a button.
     */
    role?: ButtonRole;
} & ({
    /**
     * The AppIntent to execute. AppIntent is only available for `Widget` or `LiveActivity`.
     */
    intent: AppIntent<any, any, AppIntentProtocol>;
} | {
    /**
     * The action to perform when the user triggers the button.
     */
    action: () => void;
});
/**
 * You create a button by providing an action and a label. The action is either a method or closure property that does something when a user clicks or taps the button. The label is a view that describes the button’s action — for example, by showing text, an icon, or both.
 *
 * @example
 * The label of a button can be any kind of view, such as a Text view for text-only labels:
 * ```tsx
 * <Button title="Sign in" action={handleSignIn} />
 * ```
 */
declare const Button: FunctionComponent<ButtonProps>;

type ChartScrollPosition<T> = {
    value: T;
    onChanged: (newValue: T) => void;
};
type ChartStringSelection = {
    valueType: 'string';
} & ({
    value: string | undefined | null;
    onChanged: (newValue: string | undefined | null) => void;
} | {
    value: Observable<string | null>;
});
type ChartNumberSelection = {
    valueType: 'number';
} & ({
    value: number | undefined | null;
    onChanged: (newValue: number | undefined | null) => void;
} | {
    value: Observable<number | null>;
});
type ChartSelection = ChartStringSelection | ChartNumberSelection;
type ClosedRange<T> = {
    from: T;
    to: T;
};
/**
 *  - `category`: A scale that has discrete domain values as inputs.
 *  - `date`: A date scale where each range value y can be expressed as a function of the domain value x’s timestamp, with y = a * x.timeIntervalSinceReferenceDate + b.
 *  - `linear`: A number scale where each range value y can be expressed as a linear function of the domain value x, with y = a * x + b.
 *  - `log`: A number scale where each range value y can be expressed as a logarithmic function of the domain value x, with y = a * log(x) + b.
 *  - `squareRoot`: A number scale where each range value y can be expressed as a square root function of the domain value x, with y = a * sqrt(x) + b. This is equivalent to a power scale with exponent 0.5.
 *  - `symmetricLog`: A number scale where each range value y can be expressed as a symmetric log function of the domain value x, with y = a * sign(x) * log(1 + |x * slopeAtZero|) + b. The constant slopeAtZero defaults to 1.
 */
type ChartAxisScaleType = 'category' | 'date' | 'linear' | 'log' | 'squareRoot' | 'symmetricLog';
/**
 * The ways in which you can stack marks in a chart.
 *  - `standard`: Stack marks starting at zero.
 *  - `normal`: Create normalized stacked bar and area charts.
 *  - `center`: Stack marks using a center offset.
 *  - `unstacked`: Don’t stack marks.
 */
type ChartMarkStackingMethod = 'standard' | 'normalized' | 'center' | 'unstacked';
type ChartInterpolationMethod = "cardinal" | "catmullRom" | "linear" | "monotone" | "stepCenter" | "stepEnd" | "stepStart";
type ChartSymbolShape = "asterisk" | "circle" | "cross" | "diamond" | "pentagon" | "plus" | "square" | "triangle";
/**
 * The position of an annotation.
 */
type AnnotationPosition = "automatic" | "bottom" | "bottomLeading" | "bottomTrailing" | "leading" | "overlay" | "top" | "topLeading" | "topTrailing" | "trailing";
type AnnotationOverflowResolution = {
    /**
     * The strategy to resolve X overflow.
     */
    x?: AnnotationOverflowResolutionStrategy;
    /**
     * The strategy to resolve Y overflow.
     */
    y?: AnnotationOverflowResolutionStrategy;
};
/**
 *  - `fit`: Fits the annotation automatically, adjusting its position to ensure it doesn't overflow.
 *  - `fitTo**`: Fits the annotation to the given boundary, adjusting its position to ensure it doesn't overflow.
 *  - `padScale`: Pads the scale of the chart to make space for the annotation.
 *  - `disabled`: Places the annotation "as-is".
 *  - `automatic`: Automatically chooses a overflow resolution.
 */
type AnnotationOverflowResolutionStrategy = 'automatic' | 'fit' | 'fitToPlot' | 'fitToChart' | 'fitToAutomatic' | 'padScale' | 'disabled';
/**
 * The various components of a calendar date.
 *
 * Specifying Years and Months
 *
 *  - `era`: Identifier for the era unit.
 *  - `year`: Identifier for the year unit.
 *  - `yearForWeekOfYear`: Identifier for the week-counting year unit.
 *  - `quarter`: Identifier for the quarter of the calendar.
 *  - `month`: Identifier for the month unit.
 *
 * Specifying Weeks and Days
 *
 *  - `weekOfYear`: Identifier for the week of the year unit.
 *  - `weekOfMonth`: Identifier for the week of the month calendar unit.
 *  - `weekday`: Identifier for the weekday unit.
 *  - `weekdayOrdinal`: Identifier for the weekday ordinal unit.
 *  - `day`: Identifier for the day unit.
 *
 * Specifying Hours, Minutes, and Seconds
 *
 *  - `hour`: Identifier for the hour unit.
 *  - `minute`: Identifier for the minute unit.
 *  - `second`: Identifier for the second unit.
 *  - `nanosecond`: Identifier for the nanosecond unit.
 *
 * Specifying Calendars and Time Zones
 *
 *  - `calendar`: Identifier for the calendar unit.
 *  - `timeZone`: Identifier for the time zone unit.
 */
type CalendarComponent = "era" | "year" | "month" | "day" | "hour" | "minute" | "second" | "weekday" | "weekdayOrdinal" | "quarter" | "weekOfMonth" | "weekOfYear" | "yearForWeekOfYear" | "nanosecond" | "calendar" | "timeZone";

/**
 * Hex string: `#FF0033` or `#333`
 */
type ColorStringHex = `#${string}`;
/**
 * RGBA string: `rgba(0,0,0,0.5)`.
 * This is same as css color string.
 *
 *  - R: red, 0 - 255
 *  - G: green, 0 - 255
 *  - B: blue, 0 - 255
 *  - A: alpha, 0 - 1
 */
type ColorStringRGBA = `rgba(${number},${number},${number},${number})`;
type KeywordsColor = "accentColor" | "systemRed" | "systemGreen" | "systemBlue" | "systemOrange" | "systemYellow" | "systemPink" | "systemPurple" | "systemTeal" | "systemIndigo" | "systemBrown" | "systemMint" | "systemCyan" | "systemGray" | "systemGray2" | "systemGray3" | "systemGray4" | "systemGray5" | "systemGray6" | "tintColor" | "label" | "secondaryLabel" | "tertiaryLabel" | "quaternaryLabel" | "placeholderText" | "separator" | "opaqueSeparator" | "link" | "darkText" | "lightText" | "black" | "darkGray" | "lightGray" | "white" | "gray" | "red" | "green" | "blue" | "cyan" | "yellow" | "magenta" | "orange" | "purple" | "brown" | "clear" | "systemFill" | "secondarySystemFill" | "tertiarySystemFill" | "quaternarySystemFill" | "systemBackground" | "secondarySystemBackground" | "tertiarySystemBackground" | "systemGroupedBackground" | "secondarySystemGroupedBackground" | "tertiarySystemGroupedBackground";
/**
 * You can define colors using the following 3 formats:
 *  - Keyword colors, e.g. `green` or `label`.
 *  - Hex string, `#ff0000`.
 *  - CSS rgba string, `rgba(255,255,255, 1)`.
 */
type Color = ColorStringHex | ColorStringRGBA | KeywordsColor;
type ColorWithGradientOrOpacity = {
    color: Color;
    /**
     * Returns the standard gradient for the color self
     */
    gradient: true;
    /**
     * Multiplies the opacity of the color by the given amount.
     */
    opacity: number;
} | {
    color: Color;
    /**
     * Returns the standard gradient for the color self
     */
    gradient: true;
} | {
    color: Color;
    /**
     * Multiplies the opacity of the color by the given amount.
     */
    opacity: number;
} | {
    color?: never;
    gradient?: never;
    opacity?: never;
};

/**
 * A kind of transition that applies to the content within a single view, rather than to the insertion or removal of a view.
 *  - `identity`: The identity content transition, which indicates that content changes shouldn’t animate.
 *  - `interpolate`: A content transition that indicates the views attempt to interpolate their contents during transitions, where appropriate.
 *  - `opacity`: A content transition that indicates content fades from transparent to opaque on insertion, and from opaque to transparent on removal.
 *  - `numericText`: Creates a content transition intended to be used with Text views displaying numbers.
 *  - `numericTextCountsDown`: Creates a content transition intended to be used with Text views displaying numeric text. In certain environments changes to the text will enable a nonstandard transition tailored to numeric characters that count down.
 *  - `numericTextCountsUp`: Creates a content transition intended to be used with Text views displaying numeric text. In certain environments changes to the text will enable a nonstandard transition tailored to numeric characters that count up.
 *  - `symbolEffect`: A content transition that applies the default symbol effect transition to symbol images within the inserted or removed view hierarchy. Other views are unaffected by this transition.
 *  - `symbolEffectAutomatic`: A transition that applies the default animation to a symbol-based image in a context-sensitive manner.
 *  - `symbolEffectReplace`: An effect that replaces the layers of one symbol-based image with those of another.
 */
type ContentTransition = "identity" | "interpolate" | "opacity" | "symbolEffect" | "numericText" | "numericTextCountsDown" | "numericTextCountsUp" | "symbolEffectAutomatic" | "symbolEffectReplace" | "symbolEffectAppear" | "symbolEffectDisappear" | "symbolEffectScale";
type MatchedGeometryProperties = 'frame' | 'position' | 'size';

type GradientStop = {
    color: Color;
    location: number;
};
type Gradient = GradientStop[] | Color[];
type LinearGradient = {
    colors: Color[];
    startPoint: KeywordPoint | Point;
    endPoint: KeywordPoint | Point;
} | {
    stops: GradientStop[];
    startPoint: KeywordPoint | Point;
    endPoint: KeywordPoint | Point;
} | {
    gradient: Gradient;
    startPoint: KeywordPoint | Point;
    endPoint: KeywordPoint | Point;
};
type RadialGradient = {
    stops: GradientStop[];
    center: KeywordPoint | Point;
    startRadius: number;
    endRadius: number;
} | {
    colors: Color[];
    center: KeywordPoint | Point;
    startRadius: number;
    endRadius: number;
} | {
    gradient: Gradient;
    center: KeywordPoint | Point;
    startRadius: number;
    endRadius: number;
};
type AngularGradient = {
    stops: GradientStop[];
    center: KeywordPoint | Point;
    startAngle: Angle;
    endAngle: Angle;
} | {
    colors: Color[];
    center: KeywordPoint | Point;
    startAngle: Angle;
    endAngle: Angle;
} | {
    gradient: Gradient;
    center: KeywordPoint | Point;
    startAngle: Angle;
    endAngle: Angle;
} | {
    stops: GradientStop[];
    center: KeywordPoint | Point;
    angle: Angle;
} | {
    colors: Color[];
    center: KeywordPoint | Point;
    angle: Angle;
} | {
    gradient: Gradient;
    center: KeywordPoint | Point;
    angle: Angle;
};
/**
 * (iOS 18.0+) A two-dimensional gradient defined by a 2D grid of positioned colors.
 */
type MeshGradient = {
    /**
     * The width of the mesh, i.e. the number of vertices per row.
     */
    width: number;
    /**
     * The height of the mesh, i.e. the number of vertices per column.
     */
    height: number;
    /**
     * The array of points, containing width x height elements.
     */
    points: Point[];
    /**
     * The array of colors, containing width x height elements.
     */
    colors: Color[];
    /**
     * The background color, this fills any points outside the defined vertex mesh. Defaults to "clear".
     */
    background?: Color;
    /**
     * Whether cubic (smooth) interpolation should be used for the colors in the mesh (rather than only for the shape of the mesh). Defaults to true.
     */
    smoothsColors?: boolean;
};

/**
 * The size in the minor axis of one or more rows or columns in a grid layout.
 * A number value indicates that a single item with the specified fixed size.
 */
type GridSize = number | {
    /**
     * Multiple items in the space of a single flexible item.
     */
    type: 'adaptive';
    min: number;
    max?: number | 'infinity';
} | {
    /**
     * A single flexible item.
     */
    type: 'flexible';
    min?: number;
    max?: number | 'infinity';
};
type GridItem = {
    /**
     * The alignment to use when placing each view.
     */
    alignment?: Alignment;
    /**
     * The spacing to the next item.
     */
    spacing?: number;
    /**
     * The size of the item, which is the width of a column item or the height of a row item.
     */
    size: GridSize;
};

declare class GestureInfo<Options, Value> {
    type: string;
    options: Options;
    constructor(type: string, options: Options);
    private _onChangedAction;
    private _onEndedAction;
    onChanged(callback: (value: Value) => void): this;
    onEnded(callback: (value: Value) => void): this;
    private toJson;
}

type DragGestureDetails = {
    time: number;
    /**
     * The location of the drag gesture’s current event.
     */
    location: Point;
    /**
     * The location of the drag gesture’s first event.
     */
    startLocation: Point;
    /**
     * The total translation from the start of the drag gesture to the current event of the drag gesture. This is equivalent to location.{x,y} - startLocation.{x,y}.
     */
    translation: Size;
    /**
     * The current drag velocity.
     */
    velocity: Size;
    /**
     * A prediction, based on the current drag velocity, of where the final location will be if dragging stopped now.
     */
    predictedEndLocation: Point;
    /**
     * A prediction, based on the current drag velocity, of what the final translation will be if dragging stopped now.
     */
    predictedEndTranslation: Size;
};
type DragGestureOptions = {
    /**
     * Defaults to 10.
     */
    minDistance?: number;
    /**
     * Defaults to 'local'.
     */
    coordinateSpace?: 'local' | 'global';
} | undefined | null;
declare function DragGesture(options?: DragGestureOptions): GestureInfo<DragGestureOptions, DragGestureDetails>;
type DragGesture = ReturnType<typeof DragGesture>;

type LongPressGestureOptions = {
    /**
     * The minimum duration of the long press that must elapse before the gesture succeeds.
     * Defaults to `500` ms.
     */
    minDuration?: DurationInMilliseconds;
    /**
     * The maximum distance that the fingers or cursor performing the long press can move before the gesture fails.
     * Defaults to `10000` ms.
     */
    maxDuration?: DurationInMilliseconds;
} | undefined | null;
declare function LongPressGesture(options?: LongPressGestureOptions): GestureInfo<LongPressGestureOptions, boolean>;
type LongPressGesture = ReturnType<typeof LongPressGesture>;

type MagnifyGestureValue = {
    time: Date;
    magnification: number;
    startAnchor: Point;
    startLocation: Point;
    velocity: number;
};
/**
 *
 * @param minScaleDelta The minimum scale delta required before the gesture starts.
 * @returns
 */
declare function MagnifyGesture(minScaleDelta?: number | null): GestureInfo<number | null | undefined, MagnifyGestureValue>;
type MagnifyGesture = ReturnType<typeof MagnifyGesture>;

/**
 * Represents the angle values of a rotation gesture.
 */
type AngleValue = {
    radians: number;
    degrees: number;
    animatableData: number;
    magnitude: number;
};
/**
 * Represents the value of a rotation gesture.
 */
type RotateGestureValue = {
    rotation: AngleValue;
    velocity: AngleValue;
    startAnchor: Point;
    time: Date;
};
/**
 * Creates a new rotation gesture.
 *
 * @param minAngleDelta The minimum delta required before the gesture succeeds. Defaults to 1 degree.
 * @returns A new rotation gesture.
 */
declare function RotateGesture(minAngleDelta?: Angle | null): GestureInfo<Angle | null | undefined, RotateGestureValue>;
type RotateGesture = ReturnType<typeof RotateGesture>;

declare function TapGesture(count?: number): GestureInfo<number | undefined, void>;
type TapGesture = ReturnType<typeof TapGesture>;

type Gesture = TapGesture | DragGesture | RotateGesture | LongPressGesture | MagnifyGesture;

/**
 * The spacing options between two adjacent sections in a list. When you specify a number value, it indicates that the amount of spacing to use.
 */
type ListSectionSpacing = number | 'default' | 'compact';

/**
 * A type that represents a height where a sheet naturally rests.
 *  - `large`: The system detent for a sheet at full height.
 *  - `medium`: The system detent for a sheet that’s approximately half the height of the screen, and is inactive in compact height.
 *  - When the value `0 < number <= 1`, it indicates a custom detent with the specified fractional height.
 *  - When the value `number > 1`, it indicates a custom detent with the specified height.
 */
type PresentationDetent = "large" | "medium" | number;
/**
 * Strategies for adapting a presentation to a different size class.
 *  - `automatic`: Use the default presentation adaptation.
 *  - `fullScreenCover`: Prefer a full-screen-cover appearance when adapting for size classes.
 *  - `none`: Don’t adapt for the size class, if possible.
 *  - `popover`: Prefer a popover appearance when adapting for size classes.
 *  - `sheet`: Prefer a sheet appearance when adapting for size classes.
 */
type PresentationAdaptation = "automatic" | "fullScreenCover" | "none" | "popover" | "sheet";
/**
 * The kinds of interaction available to views behind a presentation.
 *  - `automatic`: The default background interaction for the presentation.
 *  - `disabled`: People can’t interact with the view behind a presentation.
 *  - `enabled`: People can interact with the view behind a presentation.
 *  - `enabledUpThrough`: People can interact with the view behind a presentation up through a specified detent.
 */
type PresentationBackgroundInteraction = "automatic" | "disabled" | "enabled" | {
    enabledUpThrough: PresentationDetent;
};
/**
 * A behavior that you can use to influence how a presentation responds to swipe gestures.
 *  - `automatic`: The default swipe behavior for the presentation.
 *  - `resizes`: A behavior that prioritizes resizing a presentation when swiping, rather than scrolling the content of the presentation.
 *  - `scrolls`: A behavior that prioritizes scrolling the content of a presentation when swiping, rather than resizing the presentation.
 */
type PresentationContentInteraction = "automatic" | "resizes" | "scrolls";
type ModalPresentation = {
    /**
     * The modal content.
     */
    content: VirtualNode;
} & ({
    /**
     * A boolean value that determines whether to present the modal content.
     */
    isPresented: boolean;
    /**
     * The `isPresented` changed callback.
     */
    onChanged: (isPresented: boolean) => void;
} | {
    isPresented: Observable<boolean>;
    onChanged?: never;
});
type PopoverPresentation = ModalPresentation & {
    /**
     * The edge of the attachmentAnchor that defines the location of the popover’s arrow. The default is `top`.
     */
    arrowEdge?: Edge;
    /**
     * If you want to display the content as popover presentation, you must use this property.
     */
    presentationCompactAdaptation?: PresentationAdaptation | {
        /**
         * The adaptation to use in a horizontally compact size class.
         */
        horizontal: PresentationAdaptation;
        /**
         * The adaptation to use in a vertically compact size class. In a size class that is both horizontally and vertically compact, system uses the verticalAdaptation value.
         */
        vertical: PresentationAdaptation;
    };
};

/**
 * A type that specifies the appearance and interaction of navigation split views within a view hierarchy.
 *  - `automatic`: A navigation split style that resolves its appearance automatically based on the current context.
 *  - `balanced`: A navigation split style that reduces the size of the detail content to make room when showing the leading column or columns.
 *  - `prominentDetail`: A navigation split style that attempts to maintain the size of the detail content when hiding or showing the leading columns.
 */
type NavigationSplitViewStyle = "automatic" | "balanced" | "prominentDetail";

/**
 * The visual prominence of a badge.
 *  - `standard`: The standard level of prominence for a badge.
 *  - `increased`: The highest level of prominence for a badge.
 *  - `decreased`: The lowest level of prominence for a badge.
 */
type BadgeProminence = "standard" | "increased" | "decreased";
/**
 * A type indicating the prominence of a view hierarchy.
 */
type Prominence = "standard" | "increased";

/**
 * The visibility of scroll indicators of a UI element.
 *  - `automatic`: Scroll indicator visibility depends on the policies of the component accepting the visibility configuration.
 *  - `visible`: The actual visibility of the indicators depends on platform conventions like auto-hiding behaviors in iOS or user preference behaviors in macOS.
 *  - `hidden`: By default, scroll views in macOS show indicators when a mouse is connected. Use `never` to indicate a stronger preference that can override this behavior.
 *  - `never`: Scroll indicators should never be visible.
 */
type ScrollScrollIndicatorVisibility = "automatic" | "visible" | "hidden" | "never";
/**
 * The ways that scrollable content can interact with the software keyboard.
 *  - `automatic`: Determine the mode automatically based on the surrounding context.
 *  - `immediately`: Dismiss the keyboard as soon as scrolling starts.
 *  - `interactively`: Enable people to interactively dismiss the keyboard as part of the scroll operation.
 *  - `never`: Never dismiss the keyboard automatically as a result of scrolling.
 */
type ScrollDismissesKeyboardMode = "automatic" | "immediately" | "interactively" | "never";
/**
 * A type that defines the scroll behavior of a scrollable view.
 *  - `paging`: The scroll behavior that aligns scroll targets to container-based geometry.
 *  - `viewAligned`: The scroll behavior that aligns scroll targets to view-based geometry.
 *  - `viewAlignedLimitAutomatic`: By default, the behavior will be limited in compact horizontal size classes and will not be limited otherwise.
 *  - `viewAlignedLimitAlways`: Always limit the amount of views that can be scrolled.
 *  - `viewAlignedLimitNever`: Never limit the amount of views that can be scrolled.
 *  - `viewAlignedLimitAlwaysByFew`: (iOS 18.0+) Limit the number of views that can be scrolled by a single interaction to a small number of views, rather than a single view at a time. The number of views is determined automatically.
 *  - `viewAlignedLimitAlwaysByOne`: (iOS 18.0+) Limit the number of views that can be scrolled by a single interaction to a single view.
 */
type ScrollTargetBehavior = "paging" | "viewAligned" | "viewAlignedLimitAutomatic" | "viewAlignedLimitAlways" | "viewAlignedLimitNever" | "viewAlignedLimitAlwaysByFew" | "viewAlignedLimitAlwaysByOne";
/**
 * A set of view types that may be pinned to the bounds of a scroll view.
 */
type PinnedScrollViews = 'sectionHeaders' | 'sectionFooters' | 'sectionHeadersAndFooters';
/**
 * The placement of margins.
 */
type ContentMarginPlacement = "automatic" | "scrollContent" | "scrollIndicators";

/**
 * The placement of a search field in a view hierarchy.
 */
type SearchFieldPlacement = 'automatic' | 'navigationBarDrawer' | 'sidebar' | 'toolbar' | 'navigationBarDrawerAlwaysDisplay' | 'navigationBarDrawerAutomaticDisplay';
type SearchSuggestionsPlacementSet = 'content' | 'menu' | 'all';

/**
 * Represents a type of haptic and/or audio feedback that can be played.
 *  - `start`: Indicates that an activity started.
 *  - `stop`:  Indicates that an activity stopped.
 *  - `alignment`: Indicates the alignment of a dragged item.
 *  - `decrease`: Indicates that an important value decreased below a significant threshold.
 *  - `increase`: Indicates that an important value increased above a significant threshold.
 *  - `levelChange`: Indicates movement between discrete levels of pressure.
 *  - `selection`: Indicates that a UI element’s values are changing.
 *  - `success`: Indicates that a task or action has completed.
 *  - `warning`: Indicates that a task or action has produced a warning of some kind.
 *  - `error`: Indicates that an error has occurred.
 *  - `impact`: Provides a physical metaphor you can use to complement a visual experience.
 *  - `impactRigid`: Indicates a collision between hard or inflexible UI objects.
 *  - `impactSoft`: Indicates a collision between soft or flexible UI objects.
 *  - `impactSolid`: Indicates a collision between solid UI objects of medium flexibility.
 */
type SensoryFeedback = 'start' | 'stop' | 'alignment' | 'decrease' | 'increase' | 'levelChange' | 'selection' | 'success' | 'warning' | 'error' | 'impact' | 'impactRigid' | 'impactSoft' | 'impactSolid';

type ShapeStyle = Material | Color | Gradient | LinearGradient | RadialGradient | AngularGradient | MeshGradient | ColorWithGradientOrOpacity;
/**
 * The DynamicShapeStyle type allows you to define two distinct styles for a shape—one for light mode and another for dark mode. The system automatically applies the appropriate style based on the current color scheme (light or dark) of the user’s device.
 */
type DynamicShapeStyle = {
    /**
     * The shape style to use in light mode.
     */
    light: ShapeStyle;
    /**
     * The shape style to use in dark mode.
     */
    dark: ShapeStyle;
};

type EdgeCornerStyle = {
    style: "fixed";
    radius: number;
} | {
    style: "concentric";
    minimum: number;
} | "concentric";
type ConcentricRectangleShape = ({
    corners: EdgeCornerStyle;
    /**
     * Should the corner style on each corner be applied individually or uniformly. Defaults to false.
     */
    isUniform?: boolean;
} | {
    topLeadingCorner?: EdgeCornerStyle;
    topTrailingCorner?: EdgeCornerStyle;
    bottomLeadingCorner?: EdgeCornerStyle;
    bottomTrailingCorner?: EdgeCornerStyle;
} | {
    uniformBottomCorners?: EdgeCornerStyle;
    topLeadingCorner?: EdgeCornerStyle;
    topTrailingCorner?: EdgeCornerStyle;
} | {
    uniformTopCorners?: EdgeCornerStyle;
    bottomLeadingCorner?: EdgeCornerStyle;
    bottomTrailingCorner?: EdgeCornerStyle;
} | {
    uniformTopCorners?: EdgeCornerStyle;
    uniformBottomCorners?: EdgeCornerStyle;
} | {
    uniformLeadingCorners?: EdgeCornerStyle;
    topTrailingCorner?: EdgeCornerStyle;
    bottomTrailingCorner?: EdgeCornerStyle;
} | {
    uniformTrailingCorners?: EdgeCornerStyle;
    topLeadingCorner?: EdgeCornerStyle;
    bottomLeadingCorner?: EdgeCornerStyle;
} | {
    uniformLeadingCorners?: EdgeCornerStyle;
    uniformTrailingCorners?: EdgeCornerStyle;
});
type RectWithCornerRadius = {
    type: 'rect';
    /**
     * A rectangular shape with rounded corners, aligned inside the frame of the view containing it.
     */
    cornerRadius: number;
    style?: RoundedCornerStyle;
};
type RectWithCornerSize = {
    type: 'rect';
    cornerSize: {
        width: number;
        height: number;
    };
    style?: RoundedCornerStyle;
};
type RectWithCornerRadii = {
    type: 'rect';
    cornerRadii: RectCornerRadii;
    style?: RoundedCornerStyle;
};
/**
 *  - `rect`: A rectangular shape with rounded corners with different values, aligned inside the frame of the view containing it.
 *  - `circle`: A circle centered on the frame of the view containing it. The circle’s radius equals half the length of the frame rectangle’s smallest edge.
 *  - `capsule`: A capsule shape aligned inside the frame of the view containing it. A capsule shape is equivalent to a rounded rectangle where the corner radius is chosen as half the length of the rectangle’s smallest edge.
 *  - `ellipse`: An ellipse aligned inside the frame of the view containing it.
 *  - `buttonBorder`: A shape that defers to the environment to determine the resolved button border shape.
 *  - `containerRelative`: A shape that is replaced by an inset version of the current container shape. If no container shape was defined, is replaced by a rectangle.
 */
type Shape = 'rect' | 'circle' | 'capsule' | 'ellipse' | 'buttonBorder' | 'containerRelative' | {
    type: 'capsule';
    style: RoundedCornerStyle;
} | RectWithCornerRadius | RectWithCornerSize | RectWithCornerRadii;
/**
 * The type with the drawing methods on Shape to apply multiple fills and/or strokes to a shape.
 */
type ShapeProps = {
    /**
     * Trims this shape by a fractional amount based on its representation as a path.
     */
    trim?: {
        /**
         * The fraction of the way through drawing this shape where drawing starts.
         */
        from: number;
        /**
         * The fraction of the way through drawing this shape where drawing ends.
         */
        to: number;
    };
    /**
     * Fills this shape with a color or gradient.
     */
    fill?: ShapeStyle | DynamicShapeStyle;
    /**
     * The color or gradient with which to stroke this shape.
     */
    stroke?: ShapeStyle | DynamicShapeStyle | {
        /**
         * The color or gradient with which to stroke this shape.
         */
        shapeStyle: ShapeStyle | DynamicShapeStyle;
        /**
         * The style of the stroke.
         */
        strokeStyle: StrokeStyle;
    };
};
/**
 * A kind for the content shape of a view.
 * - `interaction`: The kind for hit-testing and accessibility.
 * - `dragPreview`: The kind for drag and drop previews.
 * - `contextMenuPreview`: The kind for context menu previews.
 * - `hoverEffect`: The kind for hover effects.
 * - `accessibility`: The kind for accessibility visuals and sorting.
 */
type ContentShapeKinds = "interaction" | "dragPreview" | "contextMenuPreview" | "hoverEffect" | "accessibility";

/**
 * The SwingAnimation type defines the configuration for animating a view in a swinging motion along the X and Y axes.
 */
type SwingAnimation = {
    /**
     * The animation duration, in seconds.
     */
    duration: DurationInSeconds;
    /**
     * The distance the view swings along the given axis.
     */
    distance: number;
};
type ClockHandRotationEffectPeriod = DurationInSeconds | "hourHand" | "minuteHand" | "secondHand";

/**
 * Makes symbols within the view show a particular variant.
 *  - `none`: No variant for a symbol.
 *  - `circle`: A variant that encapsulates the symbol in a circle.
 *  - `square`: A variant that encapsulates the symbol in a square.
 *  - `rectangle`: A variant that encapsulates the symbol in a rectangle.
 *  - `fill`: A variant that fills the symbol.
 *  - `slash`: A variant that draws a slash through the symbol.
 */
type SymbolVariants = 'none' | 'circle' | 'square' | 'rectangle' | 'fill' | 'slash';
/**
 *  - `hierarchical`: A mode that renders symbols as multiple layers, with different opacities applied to the foreground style.
 *  - `monochrome`: A mode that renders symbols as a single layer filled with the foreground style.
 *  - `multicolor`: A mode that renders symbols as multiple layers with their inherit styles.
 *  - `palette`: A mode that renders symbols as multiple layers, with different styles applied to the layers.
 */
type SymbolRenderingMode = 'hierarchical' | 'monochrome' | 'multicolor' | 'palette';
type SymbolEffect = "appear" | "appearByLayer" | "appearDown" | "appearUp" | "appearWholeSymbol" | "disppear" | "disappearByLayer" | "disappearDown" | "disappearUp" | "disappearWholeSymbol" | "scale" | "scaleByLayer" | "scaleDown" | "scaleUp" | "scaleWholeSymbol" | {
    /**
     * A symbol effect to add to the view. Existing effects added by ancestors of the view are preserved, but may be overridden by the new effect. Added effects will be applied to the `Image` views contained by the child view.
     */
    effect: DiscreteSymbolEffect;
    /**
     * The value to monitor for changes, the animation is triggered each time the value changes.
     */
    value: string | number | boolean;
};
type DiscreteSymbolEffect = "bounce" | "bounceByLayer" | "bounceDown" | "bounceUp" | "bounceWholeSymbol" | "breathe" | "breatheByLayer" | "breathePlain" | "breathePulse" | "breatheWholeSymbol" | "pulse" | "pulseByLayer" | "pulseWholeSymbol" | "rotate" | "rotateByLayer" | "rotateClockwise" | "rotateCounterClockwise" | "rotateWholeSymbol" | "variableColor" | "variableColorCumulative" | "variableColorDimInactiveLayers" | "variableColorHideInactiveLayers" | "variableColorIterative" | "wiggle" | "wiggleRight" | "wiggleLeft" | "wiggleBackward" | "wiggleByLayer" | "wiggleClockwise" | "wiggleCounterClockwise" | "wiggleDown" | "wiggleForward" | "wiggleUp" | "wiggleWholeSymbol";

type Font = "largeTitle" | "title" | "title2" | "title3" | "headline" | "subheadline" | "body" | "callout" | "footnote" | "caption" | "caption2";
type FontWeight = "ultraLight" | "thin" | "light" | "regular" | "medium" | "semibold" | "bold" | "heavy" | "black";
/**
 * A width to use for fonts that have multiple widths.
 */
type FontWidth = "compressed" | "condensed" | "expanded" | "standard";
type FontDesign = 'default' | 'monospaced' | 'rounded' | 'serif';
type TextAlignment = 'leading' | 'center' | 'trailing';
/**
 * The type of truncation to apply to a line of text when it’s too long to fit in the available space.
 *  - `head`: Truncate at the beginning of the line.
 *  - `middle`: Truncate in the middle of the line.
 *  - `tail`: Truncate at the end of the line.
 */
type TruncationMode = "head" | "middle" | "tail";

type KeyboardType = 'default' | 'numberPad' | 'phonePad' | 'namePhonePad' | 'URL' | 'decimalPad' | 'asciiCapable' | 'asciiCapableNumberPad' | 'emailAddress' | 'numbersAndPunctuation' | 'twitter' | 'webSearch';
/**
 * The kind of autocapitalization behavior applied during text input.
 *  - `never`: Defines an autocapitalizing behavior that will not capitalize anything.
 *  - `characters`: Defines an autocapitalizing behavior that will capitalize every letter.
 *  - `sentences`: Defines an autocapitalizing behavior that will capitalize the first letter in every sentence.
 *  - `words`: Defines an autocapitalizing behavior that will capitalize the first letter of every word.
 */
type TextInputAutocapitalization = "never" | "characters" | "sentences" | "words";
/**
 * A type that defines various triggers that result in the firing of a submission action.
 *  - `search`: Defines triggers originating from search fields constructed from `searchable` modifiers.
 *  - `text`: Defines triggers originating from text input controls like `TextField` and `SecureField`.
 */
type SubmitTriggers = "search" | "text";

/**
 * A type that defines the placement of a toolbar item.
 *  - `automatic`: The system places the item automatically, depending on many factors including the platform, size class, or presence of other items.
 *  - `bottomBar`: Places the item in the bottom toolbar.
 *  - `cancellationAction`: The item represents a cancellation action for a modal interface.
 *  - `confirmationAction`: The item represents a confirmation action for a modal interface.
 *  - `destructiveAction`: The item represents a destructive action for a modal interface.
 *  - `keyboard`: The item is placed in the keyboard section.
 *  - `navigation`: The item represents a navigation action.
 *  - `primaryAction`: The item represents a primary action.
 *  - `principal`: The system places the item in the principal item section.
 *  - `secondaryAction`: The item represents a secondary action.
 *  - `status`: The item represents a change in status for the current context.
 *  - `topBarLeading`: Places the item in the leading edge of the top bar.
 *  - `topBarTrailing`: Places the item in the trailing edge of the top bar.
 */
/**
 * The placement of the toolbar item.
 */
type ToolbarItemPlacement = 'automatic' | 'bottomBar' | 'cancellationAction' | 'confirmationAction' | 'destructiveAction' | 'keyboard' | 'navigation' | 'primaryAction' | 'principal' | 'topBarLeading' | 'topBarTrailing' | 'secondaryAction' | 'status' | 'largeSubtitle' | 'largeTitle' | 'subtitle' | 'title';
/**
 *  - `automatic`: The system places the item automatically, depending on many factors including the platform, size class, or presence of other items.
 *  - `bottomBar`: Places the item in the bottom toolbar.
 *  - `cancellationAction`: The item represents a cancellation action for a modal interface.
 *  - `confirmationAction`: The item represents a confirmation action for a modal interface.
 *  - `destructiveAction`: The item represents a destructive action for a modal interface.
 *  - `keyboard`: The item is placed in the keyboard section.
 *  - `navigation`: The item represents a navigation action.
 *  - `primaryAction`: The item represents a primary action.
 *  - `principal`: The system places the item in the principal item section.
 *  - `topBarLeading`: Places the item in the leading edge of the top bar.
 *  - `topBarTrailing`: Places the item in the trailing edge of the top bar.
 */
type ToolBarProps = {
    bottomBar?: VirtualNode | VirtualNode[];
    cancellationAction?: VirtualNode | VirtualNode[];
    confirmationAction?: VirtualNode | VirtualNode[];
    destructiveAction?: VirtualNode | VirtualNode[];
    keyboard?: VirtualNode | VirtualNode[];
    navigation?: VirtualNode | VirtualNode[];
    primaryAction?: VirtualNode | VirtualNode[];
    principal?: VirtualNode | VirtualNode[];
    topBarLeading?: VirtualNode | VirtualNode[];
    topBarTrailing?: VirtualNode | VirtualNode[];
};
/**
 * A type that defines the behavior of title of a toolbar.
 */
type ToolbarTitleDisplayMode = 'automatic' | 'inline' | 'inlineLarge' | 'large';
type ToolbarPlacement = "automatic" | "tabBar" | "bottomBar" | "navigationBar";
/**
 * Defines the implementation of all IndexView instances within a view hierarchy.
 */
type IndexViewStyle = 'page' | 'pageBackgroundAutomaticDisplay' | 'pageBackgroundAlwaysDisplay' | 'pageBackgroundNeverDisplay' | 'pageBackgroundInteractiveDisplay';
type AdaptableTabBarPlacement = 'automatic' | 'tabBar' | 'sidebar';
type TabPlacement = 'automatic' | 'pinned' | 'sidebarOnly';
type TabCustomizationBehavior = 'automatic' | 'disabled' | 'reorderable';

type ToggleStyle = 'automatic' | 'switch' | 'button';
type ButtonBorderShape = 'automatic' | 'capsule' | 'circle' | 'roundedRectangle' | 'buttonBorder' | {
    roundedRectangleRadius: number;
};
type LabelStyle = 'automatic' | 'titleOnly' | 'titleAndIcon' | 'iconOnly';
/**
 *
 *  - `automatic`: The default picker style, based on the picker’s context.
 *  - `inline`: A PickerStyle where each option is displayed inline with other views in the current container.
 *  - `menu`: A picker style that presents the options as a menu when the user presses a button, or as a submenu when nested within a larger menu.
 *  - `navigationLink`: A picker style represented by a navigation link that presents the options by pushing a List-style picker view.
 *  - `palette`: A picker style that presents the options as a row of compact elements.
 *  - `segmented`: A picker style that presents the options in a segmented control.
 *  - `wheel`: A picker style that presents the options in a scrollable wheel that shows the selected option and a few neighboring options.
 */
type PickerStyle = 'automatic' | 'inline' | 'menu' | 'navigationLink' | 'segmented' | 'palette' | 'wheel';
/**
 *  - `columns`: A non-scrolling form style with a trailing aligned column of labels next to a leading aligned column of values.
 *  - `grouped`: Rows in a grouped rows form have leading aligned labels and trailing aligned controls within visually grouped sections.
 */
type FormStyle = 'automatic' | 'columns' | 'grouped';
/**
 *  - `automatic`: The default gauge view style in the current context of the view being styled.
 *  - `accessoryCircular`: A gauge style that displays an open ring with a marker that appears at a point along the ring to indicate the gauge’s current value.
 *  - `accessoryCircularCapacity`: A gauge style that displays a closed ring that’s partially filled in to indicate the gauge’s current value.
 *  - `circular`: **(Onlay available on watchOS)** A gauge style that displays an open ring with a marker that appears at a point along the ring to indicate the gauge’s current value.
 *  - `linearCapacity`: A gauge style that displays a bar that fills from leading to trailing edges as the gauge’s current value increases.
 *  - `accessoryLinear`: A gauge style that displays bar with a marker that appears at a point along the bar to indicate the gauge’s current value.
 *  - `accessoryLinearCapacity`: A gauge style that displays bar that fills from leading to trailing edges as the gauge’s current value increases.
 *  - `linear`: **(Only available on watchOS)** A gauge style that displays a bar with a marker that appears at a point along the bar to indicate the gauge’s current value.
 */
type GaugeStyle = 'automatic' | 'accessoryCircular' | 'accessoryCircularCapacity' | 'circular' | 'linearCapacity' | 'accessoryLinear' | 'accessoryLinearCapacity' | 'linear';
/**
 *  - `automatic`: The list style that describes a platform’s default behavior and appearance for a list.
 *  - `bordered`: The list style that describes the behavior and appearance of a list with standard border.
 *  - `carousel`: The carousel list style.
 *  - `elliptical`: The list style that describes the behavior and appearance of an elliptical list.
 *  - `grouped`: The list style that describes the behavior and appearance of a grouped list.
 *  - `inset`: The list style that describes the behavior and appearance of an inset list.
 *  - `insetGroup`: The list style that describes the behavior and appearance of an inset grouped list.
 *  - `plain`: The list style that describes the behavior and appearance of a plain list.
 *  - `sidebar`: The list style that describes the behavior and appearance of a sidebar list.
 */
type ListStyle = 'automatic' | 'bordered' | 'carousel' | 'elliptical' | 'grouped' | 'inset' | 'insetGroup' | 'plain' | 'sidebar';
/**
 *  - `automatic`: The default progress view style in the current context of the view being styled.
 *  - `circular`: The style of a progress view that uses a circular gauge to indicate the partial completion of an activity. On platforms other than macOS, the circular style may appear as an indeterminate indicator instead.
 *  - `linear`: A progress view that visually indicates its progress using a horizontal bar.
 */
type ProgressViewStyle = 'linear' | 'circular' | 'automatic';
type TextFieldStyle = 'automatic' | 'plain' | 'roundedBorder';
type NavigationBarTitleDisplayMode = 'automatic' | 'inline' | 'large';
type MenuStyle = 'automatic' | 'button' | 'borderlessButton';
/**
 *  - `compactMenu`: A control group style that presents its content as a compact menu when the user presses the control, or as a submenu when nested within a larger menu.
 *  - `menu`: A control group style that presents its content as a menu when the user presses the control, or as a submenu when nested within a larger menu.
 *  - `navigation`: The navigation control group style.
 *  - `palette`: A control group style that presents its content as a palette.
 */
type ControlGroupStyle = 'automatic' | 'compactMenu' | 'menu' | 'navigation' | 'palette';
/**
 *  - `automatic`: The default button style, based on the button’s context.
 *  - `bordered`: A button style that applies standard border artwork based on the button’s context.
 *  - `borderedProminent`: A button style that applies standard border prominent artwork based on the button’s context.
 *  - `borderless`: A button style that doesn’t apply a border.
 *  - `plain`: A button style that doesn’t style or decorate its content while idle, but may apply a visual effect to indicate the pressed, focused, or enabled state of the button.
 */
type ButtonStyle = 'automatic' | 'bordered' | 'borderless' | 'borderedProminent' | 'plain' | 'glass' | 'glassProminent';
/**
 *  - `automatic`: The default tab view style.
 *  - `page`: A TabViewStyle that displays a paged scrolling TabView.
 *  - `sidebarAdaptable`: (iOS 18.0+) A tab bar style that adapts to each platform.
 *  - `tabBarOnly`: (iOS 18.0+) A tab view style that displays a tab bar when possible.
 *  - `pageAlwaysDisplayIndex`: Always display an index view regardless of page count
 *  - `pageAutomaticDisplayIndex`: Displays an index view when there are more than one page
 *  - `pageNeverDisplayIndex`: Never display an index view
 */
type TabViewStyle = "automatic" | "page" | "sidebarAdaptable" | "tabBarOnly" | "pageAlwaysDisplayIndex" | "pageAutomaticDisplayIndex" | "pageNeverDisplayIndex";
/**
 * A type that specifies the appearance and interaction of all date pickers within a view hierarchy.
 *  - `automatic`: The default style for date pickers.
 *  - `compact`: A date picker style that displays the components in a compact, textual format.
 *  - `graphical`: A date picker style that displays an interactive calendar or clock.
 *  - `wheel`: A date picker style that displays each component as columns in a scrollable wheel.
 *  - `field`: Only available in macOS. A date picker style that displays the components in an editable field.
 *  - `stepperField`: Only available in macOS. A system style that displays the components in an editable field, with adjoining stepper that can increment/decrement the selected component.
 */
type DatePickerStyle = 'automatic' | 'compact' | 'graphical' | 'wheel' | 'field' | 'stepperField';

type ChartMarkProps = {
    /**
     * Sets the foreground style for the chart content.
     */
    foregroundStyle?: ShapeStyle | DynamicShapeStyle;
    /**
     * Sets the opacity for the chart content.
     */
    opacity?: number;
    /**
     * Sets the corner radius of the chart content.
     */
    cornerRadius?: number;
    /**
     * Sets the style for line marks.
     */
    lineStyle?: StrokeStyle;
    /**
     * Plots line and area marks with the interpolation method that you specify.
     */
    interpolationMethod?: ChartInterpolationMethod;
    /**
     * A Boolean value that indicates whether to align this item’s styles with the plotting area.
     */
    alignsMarkStylesWithPlotArea?: boolean;
    /**
     * Sets a plotting symbol type for the chart content. Or sets a view to use as the symbol for the chart content.
     */
    symbol?: ChartSymbolShape | VirtualNode;
    /**
     * Sets the plotting symbol size for the chart content.
     */
    symbolSize?: number | {
        width: number;
        height: number;
    };
    /**
     * Annotates this mark or collection of marks with a view positioned relative to its bounds.
     */
    annotation?: VirtualNode | {
        /**
         * The location relative to the item being annotated at which the annotation will be placed.
         */
        position?: AnnotationPosition;
        /**
         * The guide for aligning the annotation in the specified position.
         */
        alignment?: Alignment;
        /**
         * Distance between the annotation and the annotated content, or nil if you want to use the default distance.
         */
        spacing?: number;
        /**
         * How to resolve the annotation exceeding the boundary of the plot.
         */
        overflowResolution?: AnnotationOverflowResolution;
        /**
         * A view that creates the annotation.
         */
        content: VirtualNode;
    };
    /**
     * Sets a clip shape for the chart content.
     */
    clipShape?: Shape | 'concentricRect' | ({
        type: 'concentricRect';
    } & ConcentricRectangleShape);
    /**
     * A chart content that adds a shadow to this chart content.
     */
    shadow?: {
        /**
         * The shadow’s color.
         */
        color?: Color;
        /**
         * A measure of how much to blur the shadow. Larger values result in more blur.
         */
        radius: number;
        /**
         * An amount to offset the shadow horizontally. Defaults to 0.
         */
        x?: number;
        /**
         * An amount to offset the shadow vertically. Defaults to 0.
         */
        y?: number;
    };
    /**
     * Applies a Gaussian blur to this chart content.
     */
    blur?: number;
    /**
     * Controls the display order of overlapping chart content.
     */
    zIndex?: number;
    /**
     *  Applies an offset to the chart content.
     */
    offset?: {
        x: number;
        y: number;
    } | {
        x: number;
        yStart: number;
        yEnd: number;
    } | {
        xStart: number;
        xEnd: number;
        y: number;
    } | {
        xStart: number;
        xEnd: number;
        yStart: number;
        yEnd: number;
    };
    /**
     * Represents data using a foreground style. Do not set it together with `foregroundStyle`.
     */
    foregroundStyleBy?: string | number | Date | {
        /**
         * The data value to encode using foreground style.
         */
        value: string | number | Date;
        /**
         * Defaults to "ForegroundStyleLabel".
         */
        label: string;
    };
    /**
     * Represents data using line styles. Do not set it together with `lineStyle`.
     */
    lineStyleBy?: string | number | Date | {
        /**
         * The data value to encode using line style.
         */
        value: string | number | Date;
        /**
         * Defaults to "LineStyleLabel".
         */
        label: string;
    };
    /**
     * Represents data using position.
     */
    positionBy?: string | number | Date | {
        /**
         * The data used for positioning marks.
         */
        value: string | number | Date;
        /**
         * Defaults to "PositionByLabel".
         */
        label?: string;
        /**
         * The axis to position marks along.
         */
        axis: Axis;
        /**
         * The span of the positioned marks. Use this to control the total amount space available to the marks.
         */
        span?: MarkDimension;
    };
    /**
     * Represents data using different kinds of symbols. Do not set it together with `symbol`.
     */
    symbolBy?: string | number | Date | {
        /**
         * The data value.
         */
        value: string | number | Date;
        /**
         * Defaults to "SymbolLabel".
         */
        label: string;
    };
    /**
     * Represents data using symbol sizes. Do not set it together with `symbolSize`.
     */
    symbolSizeBy?: string | number | Date | {
        /**
         * The data value.
         */
        value: string | number | Date;
        /**
         * Defaults to "SymbolSizeLabel".
         */
        label: string;
    };
};
type BarChartProps = {
    /**
     * If specify to true, display the labels on Y Axis, the bars will be displayed horizontally. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
        width?: MarkDimension;
        height?: MarkDimension;
        stacking?: ChartMarkStackingMethod;
    } & ChartMarkProps>;
};
declare const BarChart: FunctionComponent<BarChartProps>;
declare const LineChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis, the bars will be displayed horizontally. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
    } & ChartMarkProps>;
}>;
declare const RectChart: FunctionComponent<BarChartProps>;
declare const AreaChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis, the bars will be displayed horizontally. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
        stacking?: ChartMarkStackingMethod;
    } & ChartMarkProps>;
}>;
declare const BarStackChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis, the bars will be displayed horizontally. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        category: string;
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
        width?: MarkDimension;
        height?: MarkDimension;
    } & ChartMarkProps>;
}>;
declare const LineCategoryChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis, the bars will be displayed horizontally. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        category: string;
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
    } & ChartMarkProps>;
}>;
declare const AreaStackChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        category: string;
        label: string | Date;
        value: number;
        unit?: CalendarComponent;
        stacking?: ChartMarkStackingMethod;
    } & ChartMarkProps>;
}>;
type BarGanttChartProps = {
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        start: number;
        end: number;
        unit?: CalendarComponent;
        size?: MarkDimension;
    } & ChartMarkProps>;
};
declare const BarGanttChart: FunctionComponent<BarGanttChartProps>;
declare const RangeAreaChart: FunctionComponent<BarGanttChartProps>;
declare const Bar1DChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        category: string;
        value: number;
    } & ChartMarkProps>;
}>;
declare const PointChart: FunctionComponent<{
    marks: Array<{
        x: number;
        y: number;
    } & ChartMarkProps>;
}>;
declare const Point1DChart: FunctionComponent<{
    /**
     * Render the points horizontally or vertically. Defaults to false.
     */
    horizontal?: boolean;
    marks: ({
        value: number;
    } & ChartMarkProps)[];
}>;
declare const PointCategoryChart: FunctionComponent<{
    marks: Array<{
        x: number;
        y: number;
        category: string;
    } & ChartMarkProps>;
    /**
     * What type should use for representing data. You can also use `foregroundStyleBy`, `symbolBy` or `symbolSize` for each mark instead.
     */
    representsDataUsing?: "foregroundStyle" | "symbol" | "symbolSize";
}>;
declare const HeatMapChart: FunctionComponent<{
    marks: Array<{
        x: string;
        y: string;
        value: number;
    } & ChartMarkProps>;
}>;
declare const RuleChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        start: number;
        end: number;
        unit?: CalendarComponent;
    } & ChartMarkProps>;
}>;
declare const RuleLineForValueChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        value: number;
    } & ChartMarkProps>;
}>;
declare const RuleLineForLabelChart: FunctionComponent<{
    /**
     * If specify to true, display the labels on Y Axis. Defaults to false.
     */
    labelOnYAxis?: boolean;
    marks: Array<{
        label: string | Date;
        unit?: CalendarComponent;
    } & ChartMarkProps>;
}>;
declare const RectAreaChart: FunctionComponent<{
    marks: Array<{
        xStart: number;
        xEnd: number;
        yStart: number;
        yEnd: number;
    } & ChartMarkProps>;
}>;
declare const PieChart: FunctionComponent<{
    marks: Array<{
        category: string;
        value: number;
    } & ChartMarkProps>;
}>;
declare const DonutChart: FunctionComponent<{
    marks: Array<{
        category: string;
        /**
         * A plottable value that will map to the angular size of the sector. It’s either a value that the angle within the full circle will be proportional with, or a value range for explicit start/end angles.
         */
        value: number;
        /**
         * The inner radius of the sector.
         * A ratio relative to the outer radius.
         */
        innerRadius?: MarkDimension;
        /**
         * The outer radius of the sector. A inset relative to the available plot area.
         */
        outerRadius?: MarkDimension;
        /**
         * A radius for the corners of the sector.
         */
        angularInset?: number;
    } & ChartMarkProps>;
}>;
/**
 * A view that displays a chart.
 *
 */
declare const Chart: FunctionComponent<{
    children: (VirtualNode | null | (VirtualNode | null)[])[] | VirtualNode;
}>;

type ColorPickerProps = ({
    /**
     * The title of the picker.
     */
    title: string;
    children?: never;
} | {
    /**
     * A view that describes the use of the selected color. The system color picker UI sets it’s title using the text from this view.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
    title?: never;
}) & {
    /**
     * A boolean value that indicates whether the color picker allows adjusting the selected color’s opacity; the default is true.
     */
    supportsOpacity?: boolean;
} & ({
    /**
     * Color value.
     */
    value: Color;
    /**
     * Color changed handler.
     */
    onChanged: (value: Color) => void;
} | {
    value: Observable<Color>;
    onChanged?: never;
});
/**
 * A control used to select a color from the system color picker UI.
 * @example
 * ```tsx
 * function View() {
 *   const color = useObservableColor('#ff0000')
 *   return <ColorPicker
 *     title="Pick a color"
 *     value={color}
 *   />
 * }
 * ```
 */
declare const ColorPicker: FunctionComponent<ColorPickerProps>;

type ContentAvailableViewWithTitleProps = {
    /**
     * A string used as the title.
     */
    title: string;
    /**
     * A system icon image.
     */
    systemImage: string;
    /**
     * The content that describes the interface.
     */
    description?: string;
} & {
    label?: never;
    actions?: never;
};
type ContentAvailableViewWithLabelProps = {
    /**
     * The label that describes the view.
     */
    label: VirtualNode;
    /**
     * The view that describes the interface.
     */
    description?: VirtualNode | null;
    /**
     * The content of the interface actions.
     */
    actions?: (VirtualNode | null)[];
} & {
    title?: never;
    systemImage?: never;
};
type ContentAvailableViewProps = ContentAvailableViewWithTitleProps | ContentAvailableViewWithLabelProps;
/**
 * An interface, consisting of a label and additional content, that you display when the content of your app is unavailable to users.
 *
 * @example
 * ```tsx
 * function View({documents}: {documents: {name: string}[]}) {
 *   <NavigationStack>
 *     <List
 *       overlay={
 *         documents.length > 0
 *           ? undefined
 *           : <ContentUnavailableView
 *              title="No documents"
 *              systemImage="tray.fill"
 *             />
 *       }
 *     >
 *       {documents.map(item => (
 *         <Text>{item.name}</Text>)
 *       )}
 *     </List>
 *   </NavigationStack>
 * }
 * ```
 */
declare const ContentUnavailableView: FunctionComponent<ContentAvailableViewProps>;

type ControlGroupProps = {
    /**
     * The content to display.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & ({
    /**
     * A string that describes the contents of the group.
     */
    title: string;
    /**
     * The name of the image resource to lookup.
     */
    systemImage?: string;
} | {
    /**
     * A view that describes the purpose of the group.
     */
    label: VirtualNode;
} | {
    title?: never;
    systemImage?: never;
    label?: never;
});
/**
 * A container view that displays semantically-related controls in a visually-appropriate manner for the context
 *
 */
declare const ControlGroup: FunctionComponent<ControlGroupProps>;

type DateLabelProps = {
    style: 'date' | 'time' | 'timer' | 'relative' | 'offset';
} & ({
    /**
     * Future date timestamp: `Date.now() + 1000 * 60`
     */
    timestamp: number;
    date?: never;
} | {
    date: Date;
    timestamp?: never;
});
/**
 * Displaying dynamic dates in widgets.
 *
 * Show up-to-date, time-based information in your widget even when it isn’t running.
 *
 *
 *
 * @example
 *  ```tsx
 *  // A style displaying a date, example output: `June 3, 2019`
 *  <DateLabel
 *    timestamp={new Date}
 *    style="date"
 *  />
 *
 *  // A style displaying only the time component for a date, example output: `11:23PM`
 *  <DateLabel
 *    timestamp={new Date}
 *    style="time"
 *  />
 *
 *  // A style displaying a date as timer counting from now, example output: `2:32`, `36:59:01`
 *  <DateLabel
 *    timestamp={new Date}
 *    style="timer"
 *  />
 *
 *  // A style displaying a date as relative to now, example ouput: `2 hours, 23 minutes`,  `1 year, 1 month`
 *  <DateLabel
 *    timestamp={new Date}
 *    style="relative"
 *  />
 *
 *  // A style displaying a date as offset from now, example output: `+2 hours`, `-3 months`
 *  <DateLabel
 *    timestamp={new Date}
 *    style="offset"
 *  />
 * ```
 */
declare const DateLabel: FunctionComponent<DateLabelProps>;
type DateRangeLabelProps = {
    /**
     * Timestamp of the start date
     * @deprecated
     * Use `from: Date` instead
     */
    from: number;
    /**
     * Timestamp of the end date
     * @deprecated
     * Use `to: Date` instead
     */
    to: number;
} | {
    from: Date;
    to: Date;
};
/**
 * Displays a localized range between two dates.
 *
 *
 *
 * @example
 *
 * <DateRangeLabel
 *   from={new Date}
 *   to={new Date(Date.now() + 1000 * 60)}
 * />
 */
declare const DateRangeLabel: FunctionComponent<DateRangeLabelProps>;
type DateIntervalLabelProps = {
    /**
     * Timestamp of the start date
     * @deprecated
     * Use `from: Date` instead
     */
    from: number;
    /**
     * Timestamp of the end date
     * @deprecated
     * Use `to: Date` instead
     */
    to: number;
} | {
    from: Date;
    to: Date;
};
/**
 * Displays a localized range between two dates.
 *
 *
 *
 * @example
 * ```tsx
 * // Example output: `9:30AM - 3:30PM`
 *
 * let fromDate = new Date()
 * fromDate.setHours(9)
 * fromDate.setMinutes(30)
 *
 * let toDate = new Date()
 * toDate.setHours(15)
 * toDate.setMinutes(30)
 *
 * <DateIntervalLabel
 *   from={fromDate}
 *   to={toDate}
 * />
 * ```
 */
declare const DateIntervalLabel: FunctionComponent<DateRangeLabelProps>;
type TimerIntervalLabelProps = {
    /**
     * Whether to count up or down. The default is `true`.
     */
    countsDown?: boolean;
    /**
     * Whether to include an hours component if there are
     * more than 60 minutes left on the timer. The default is `true`.
     */
    showsHours?: boolean;
} & ({
    /**
     * Timestamp of the start date
     * @deprecated
     * Use `from: Date` instead
     */
    from: number;
    /**
     * Timestamp of the end date
     * @deprecated
     * Use `to: Date` instead
     */
    to: number;
    /**
     * If present, the date at which to pause the timer.
     * The default is `undefined` which indicates to never pause.
     *
     * @deprecated
     * Use `pauseTime: Date` instead
     */
    pauseTime?: number;
} | {
    from: Date;
    to: Date;
    pauseTime?: Date;
});
/**
 * Displays a timer counting within the provided interval.
 *
 *
 *
 * @example
 * ```tsx
 * // The example above shows a text that displays a timer counting down
 * // from "12:00" and will pause when reaching "10:00".
 * <TimerIntervalLabel
 *   from={new Date}
 *   to={new Date(Date.now() + 1000 * 60 * 12)}
 *   pauseTime={new Date(Date.now() + 1000 * 60 * 10)}
 * />
 *
 * // `from` and `to`: The interval between where to run the timer.
 * // `pauseTime`: If present, the date at which to pause the timer. The default is `undefined` which indicates to never pause.
 * // `countsDown`: Whether to count up or down. The default is `true`.
 * // `showsHours`: Whether to include an hours component if there are more than 60 minutes left on the timer. The default is `true`.
 * ```
 */
declare const TimerIntervalLabel: FunctionComponent<TimerIntervalLabelProps>;

/**
 *  - `date`: Displays day, month, and year based on the locale.
 *  - `hourAndMinute`: Displays hour and minute components based on the locale.
 *  - `hourMinuteAndSecond`: Only available in watchOS. Displays hour, minute and second components based on the locale.
 */
type DatePickerComponents = 'hourAndMinute' | 'date' | 'hourMinuteAndSecond';
type DatePickerProps = ({
    title: string;
    children?: never;
} | {
    title?: never;
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
}) & {
    /**
     * The date components that user is able to view and edit. Defaults to ['hourAndMinute', 'date'].
     */
    displayedComponents?: DatePickerComponents[];
} & ({
    /**
     * Timestamp of Date.
     */
    value: number;
    /**
     * Date value changed handler.
     */
    onChanged: (value: number) => void;
    /**
     * The start date of selectable dates.
     */
    startDate?: number;
    /**
     * The end date of selectable dates.
     */
    endDate?: number;
} | {
    value: Observable<Date>;
    startDate?: Date;
    endDate?: Date;
    onChanged?: never;
});
/**
 * Use a DatePicker when you want to provide a view that allows the user to select a calendar date, and optionally a time.
 *
 */
declare const DatePicker: FunctionComponent<DatePickerProps>;

type DisclosureGroupProps = ({
    /**
     * A description of the content of the disclosure group.
     */
    title: string;
} | {
    /**
     * A description of the content of the disclosure group.
     */
    label: VirtualNode;
}) & {
    /**
     * The content shown when the disclosure group expands.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
} & ({
    /**
     * A boolean value that determines the group’s expansion state (expanded or collapsed).
     */
    isExpanded?: boolean;
    /**
     * The `isExpanded` value changed handler.
     */
    onChanged?: (value: boolean) => void;
} | {
    isExpanded?: Observable<boolean>;
    onChanged?: never;
});
/**
 * A view that shows or hides another content view, based on the state of a disclosure control.
 *
 */
declare const DisclosureGroup: FunctionComponent<DisclosureGroupProps>;

/**
 * A visual element that can be used to separate other content.
 *
 *
 */
declare const Divider: FunctionComponent<{}>;

/**
 * A button that toggles the edit mode environment value.
 *
 */
declare const EditButton: FunctionComponent<{}>;

type EditorProps = {
    /**
     * You can provide this value to override the value of `Script.name`. When the editor code is running, the default value of `Script.name` is `"Temporary Script"`.
     */
    scriptName?: string;
    /**
     * Whether to show the accessory view when the keyboard is visible. This is useful for showing buttons like "Move Left", "Move Right", "Delete", "Dissmiss Keyboard", etc. Defaults to `false`. It is recommended to set this to `true` when the editor is fully visible on the screen, such as when the editor is the only view in the screen.
     */
    showAccessoryView?: boolean;
    /**
     * The editor controller to access and set content, file extension, read only state, listen for content changes.
     */
    controller: EditorController;
};
/**
 * Display an editor in the views.
 * @example
 * ```tsx
 * function MyEditor() {
 *   const controller = useMemo(() => {
 *     return new EditorController({
 *       content: `const text = "Hello, World!"`,
 *       ext: "txt",
 *       readOnly: false,
 *     })
 *   }, [])
 *
 *   useEffect(() => {
 *     return () => {
 *       // Dispose the controller when the component is unmounted
 *        controller.dispose()
 *     }
 *   }, [controller])
 *
 *   return (
 *     <Editor
 *       controller={controller}
 *       scriptName="My Script"
 *     />
 *   )
 * }
 * ```
 */
declare const Editor: FunctionComponent<EditorProps>;

declare const EmptyView: FunctionComponent<{}>;

/**
 * Options that control how adding a gesture to a view affects other gestures recognized by the view and its subviews.
 *  - `all`: Enable both the added gesture as well as all other gestures on the view and its subviews.
 *  - `gesture`: Enable the added gesture but disable all gestures in the subview hierarchy.
 *  - `subviews`: Enable all gestures in the subview hierarchy but disable the added gesture.
 *  - `none`: Disable all gestures in the subview hierarchy, including the added gesture.
 */
type GestureMask = "all" | "gesture" | "subviews" | "none";
type GestureProps = Gesture | {
    /**
     * A gesture to attach to the view.
     */
    gesture: Gesture;
    /**
     * A value that controls how adding this gesture to the view affects other gestures recognized by the view and its subviews. Defaults to "all".
     */
    mask: GestureMask;
} | {
    gesture: Gesture;
    /**
     * Whether the added gesture is enabled.
     */
    isEnabled: boolean;
};
type GesturesProps = {
    /**
     * The gesture to apply to the view
     * @example
     * ```tsx
     * <Text
     *   gesture={
     *     TapGesture()
     *       .onEnded(() => console.log('Tapped'))
     *   }
     * />
     * ```
     */
    gesture?: GestureProps;
    /**
     * Attaches a gesture to the view to process simultaneously with gestures defined by the view.
     * @example
     * ```tsx
     * <Text
     *   simultaneousGesture={
     *     TapGesture()
     *       .onEnded(() => console.log('Tapped'))
     *   }
     * />
     * ```
     */
    simultaneousGesture?: GestureProps;
    /**
     * Attaches a gesture to the view with a higher precedence than gestures defined by the view.
     * @example
     * ```tsx
     * <Text
     *   highPriorityGesture={
     *     TapGesture()
     *       .onEnded(() => console.log('Tapped'))
     *   }
     * />
     * ```
     */
    highPriorityGesture?: GestureProps;
    /**
     * Sets the screen edge from which you want your gesture to take precedence over the system gesture.
     */
    defersSystemGestures?: EdgeSet;
    /**
     * Adds an action to perform when this view recognizes a tap gesture.
     */
    onTapGesture?: (() => void) | {
        /**
         * The number of taps or clicks required to trigger the action closure provided in action. Defaults to 1.
         */
        count: number;
        /**
         * The coordinate space in which to receive location values. Defaults to "local".
         *  - `local`: The local coordinate space of the current view.
         *  - `global`: The global coordinate space at the root of the view hierarchy.
         *  - `scrollView`: The named coordinate space that is added by the system for the innermost containing scroll view.
         *  - `immersiveSpace`: The named coordinate space that represents the currently opened ImmersiveSpace scene. If no immersive space is currently opened, this CoordinateSpace provides the same behavior as the "global" coordinate space.
         */
        coordinateSpace?: "local" | "global" | "scrollView" | "immersiveSpace";
        /**
         * The action to perform.
         */
        perform: () => void;
    };
    /**
     * Adds an action to perform when this view recognizes a long press gesture.
     */
    onLongPressGesture?: (() => void) | {
        /**
         * The minimum duration of the long press that must elapse before the gesture succeeds.
         * Defaults to `500` ms.
         */
        minDuration?: DurationInMilliseconds;
        /**
         * The maximum distance that the fingers or cursor performing the long press can move before the gesture fails.
         * Defaults to `10000` ms.
         */
        maxDuration?: DurationInMilliseconds;
        /**
         * The action to perform when a long press is recognized.
         */
        perform: () => void;
        /**
         * A callback to run when the pressing state of the gesture changes, passing the current state as a parameter.
         */
        onPressingChanged?: (state: boolean) => void;
    };
    /**
     * A dragging motion that invokes an action as the drag-event sequence changes.
     * @param onDragGesture.minDistance The minimum dragging distance for the gesture to succeed. Defaults to 10.
     * @param onDragGesture.coordinateSpace The coordinate space of the dragging gesture’s location. Defaults to `locale`.
     * @param onDragGesture.onChanged Adds an action to perform when the gesture’s value changes. The action to perform when this gesture’s value changes. The action closure’s parameter contains the gesture’s new value.
     * @param onDragGesture.onEnded Adds an action to perform when the gesture ends. The action to perform when this gesture ends. The action closure’s parameter contains the final value of the gesture.
     */
    onDragGesture?: {
        minDistance?: number;
        coordinateSpace?: 'local' | 'global';
        onChanged?: (action: DragGestureDetails) => void;
        onEnded?: (action: DragGestureDetails) => void;
    };
    /**
     * Set the current view to receive files or pictures dragged from other apps.
     * @param onDropContent.types The uniform type identifiers that describe the types of content this view can accept through drag and drop. If the drag-and-drop operation doesn’t contain any of the supported types, then this drop destination doesn’t activate and isTargeted doesn’t update.
     * @param onDropContent.isTarget A binding object that updates when a drag and drop operation enters or exits the drop target area. The binding’s value is true when the cursor is inside the area, and false when the cursor is outside.
     * @param onDropContent.onResult The callback function when the file content of the specified type is dropped in.
     * @example
     * ```tsx
     * const [isTarget, setIsTarget] = useState(false)
     *
     * return <VStack
     *   onDropContent={{
     *     types: ["public.image"],
     *     isTarget: {
     *       value: isTarget,
     *       onChanged: setIsTarget
     *     },
     *     onResult: (result) => {
     *        console.log(`Receieved ${result.images.length} image(s)`)
     *     }
     *   }}
     * >
     * ...
     * </VStack>
     * ```
     */
    onDropContent?: {
        types: UTType[];
        isTarget: {
            value: boolean;
            onChanged: (value: boolean) => void;
        };
        onResult: (result: {
            texts: string[];
            images: UIImage[];
            fileURLs: string[];
        }) => void;
    };
    /**
     * Configures whether this view participates in hit test operations.
     */
    allowsHitTesting?: boolean;
};

type FrameSizeProps = {
    frame?: {
        width?: number;
        height?: number;
        /**
         * The alignment of this view inside the resulting frame.
         * Note that most alignment values have no apparent effect when the
         * size of the frame happens to match that of this view.
         */
        alignment?: Alignment;
    } | {
        /**
         * The alignment of this view inside the resulting frame.
         * Note that most alignment values have no apparent effect when the
         * size of the frame happens to match that of this view.
         */
        alignment?: Alignment;
        /**
         * The minimum width of the resulting frame.
         */
        minWidth?: number;
        /**
         * The minimum height of the resulting frame.
         */
        minHeight?: number;
        /**
         * The maximum width of the resulting frame.
         */
        maxWidth?: number | 'infinity';
        /**
         * The maximum height of the resulting frame.
         */
        maxHeight?: number | 'infinity';
        /**
         * The ideal width of the resulting frame.
         */
        idealWidth?: number | 'infinity';
        /**
         * The ideal height of the resulting frame.
         */
        idealHeight?: number | 'infinity';
    };
    /**
     * Positions this view within an invisible frame with a size relative to the nearest container.
     * @see https://developer.apple.com/documentation/swiftui/view/containerrelativeframe(_:alignment:)
     * @see https://www.hackingwithswift.com/quick-start/swiftui/how-to-adjust-the-size-of-a-view-relative-to-its-container
     */
    containerRelativeFrame?: {
        axes: AxisSet;
        /**
         * Defaults to `center`.
         */
        alignment?: Alignment;
        count: never;
        span: never;
        spacing: never;
    } | {
        axes: AxisSet;
        /**
         * Defaults to `center`.
         */
        alignment?: Alignment;
        /**
         * How many parts the container's space should be split into.
         */
        count: number;
        /**
         * How many parts should be allocated to for each view.
         * Defaults to 1.
         */
        span?: number;
        spacing: number;
    };
    /**
     * Fixes this view at its ideal size.
     */
    fixedSize?: boolean | {
        /**
         * A Boolean value that indicates whether to fix the width of the view.
         */
        horizontal: boolean;
        /**
         * A Boolean value that indicates whether to fix the height of the view.
         */
        vertical: boolean;
    };
};

type ForeAndBackgroundProps = {
    /**
     * Sets a view’s foreground elements to use a given style. You can also sets the primary, secondary, and tertiary levels of the foreground style.
     */
    foregroundStyle?: ShapeStyle | DynamicShapeStyle | {
        primary: ShapeStyle | DynamicShapeStyle;
        secondary: ShapeStyle | DynamicShapeStyle;
        tertiary?: ShapeStyle | DynamicShapeStyle;
    };
    /**
     * Sets the view’s background to an insettable shape filled with a style. You can also layers the views that you specify behind this view.
     */
    background?: ShapeStyle | DynamicShapeStyle | {
        style: ShapeStyle | DynamicShapeStyle;
        shape: Shape | 'concentricRect' | ({
            type: 'concentricRect';
        } & ConcentricRectangleShape);
    } | VirtualNode | {
        content: VirtualNode;
        alignment: Alignment;
    };
    /**
     * Adds the background extension effect to the view. The view will be duplicated into mirrored copies which will be placed around the view on any edge with available safe area. Additionally, a blur effect will be applied on top to blur out the copies.
     * @available iOS 26.0+
     */
    backgroundExtensionEffect?: boolean;
};

type PaddingAndBorderProps = {
    /**
     * When specify to true, will apply the default padding.
     */
    padding?: true | number | {
        horizontal?: number | true;
        vertical?: number | true;
        leading?: number | true;
        trailing?: number | true;
        top?: number | true;
        bottom?: number | true;
    };
    /**
     * Adds a border to this view with the specified style and width.
     */
    border?: {
        style: ShapeStyle | DynamicShapeStyle;
        /**
         * The thickness of the border. The default is 1 pixel.
         */
        width?: number;
    } | ShapeStyle | DynamicShapeStyle;
};

type ViewVisibilityProps = {
    /**
     * Hidden views are invisible and can’t receive or respond to interactions. However, they do remain in the view hierarchy and affect layout.
     */
    hidden?: boolean;
    /**
     * Hides the labels of any controls contained within this view.
     */
    labelsHidden?: boolean;
};

type ImageViewProps = {
    /**
     * Scales this view to fit its parent.
     */
    scaleToFit?: boolean;
    /**
     * Scales this view to fill its parent.
     */
    scaleToFill?: boolean;
    /**
     * Constrains this view’s dimensions to the specified aspect ratio.
     */
    aspectRatio?: {
        /**
         * The ratio of width to height to use for the resulting view. Use null to maintain the current aspect ratio in the resulting view.
         */
        value?: number | null;
        /**
         * A flag that indicates whether this view fits or fills the parent context.
         */
        contentMode: ContentMode;
    };
    /**
     * Scales images within the view according to one of the relative sizes available including small, medium, and large images sizes.
     */
    imageScale?: ImageScale;
};

type ViewStyleProps = {
    /**
     * Sets the style for control groups within this view.
     */
    controlGroupStyle?: ControlGroupStyle;
    /**
     * Sets the style for menus within this view.
     */
    menuStyle?: MenuStyle;
    /**
     * The style to apply to this tab view.
     */
    tabViewStyle?: TabViewStyle;
    /**
     * Sets the size for controls within this view.
     */
    controlSize?: ControlSize;
    /**
     * A type that applies custom interaction behavior and a custom appearance to all buttons within a view hierarchy.
     */
    buttonStyle?: ButtonStyle;
    /**
     * The border shape affects buttons of the `bordered` and `borderedProminent` styles.
     *  - `automatic`: A shape that defers to the system to determine an appropriate shape for the given context and platform.
     *  - `capsule`: A capsule shape.
     *  - `circle`: A circular shape.
     *  - `roundedRectangle`: A rounded rectangle shape.
     *  - `buttonBorder`: A shape that defers to the environment to determine the resolved button border shape.
     */
    buttonBorderShape?: ButtonBorderShape;
    /**
     * Sets the style for labels within this view.
     */
    labelStyle?: LabelStyle;
    /**
     * The appearance and behavior of a toggle.
     */
    toggleStyle?: ToggleStyle;
    /**
     * Sets the style for pickers within this view.
     */
    pickerStyle?: PickerStyle;
    /**
     * Sets the style for forms in a view hierarchy.
     */
    formStyle?: FormStyle;
    datePickerStyle?: DatePickerStyle;
    /**
     * Sets the style for text fields within this view.
     */
    textFieldStyle?: TextFieldStyle;
    /**
     * The gauge view style to use for this view.
     */
    gaugeStyle?: GaugeStyle;
    /**
     * The style describes the behavior and appearance of a list.
     */
    listStyle?: ListStyle;
    /**
     * The progress view style to use for this view.
     */
    progressViewStyle?: ProgressViewStyle;
    /**
     * Adds a context menu with a custom preview to a view.
     *
     * @example
     * ```tsx
     * function View() {
     *   return <Text
     *     contextMenu={{
     *       menuItems: <Group>
     *         <Button
     *           title="Add"
     *           action={() => {
     *             // Add
     *           }}
     *         />
     *         <Button
     *           title="Delete"
     *           role="destructive"
     *           action={() => {
     *             // Delete
     *           }}
     *         />
     *       </Group>
     *     }}
     *   >Long Press to Open Context Menu</Text>
     * }
     * ```
     */
    contextMenu?: {
        /**
         * The menu’s contents
         */
        menuItems: VirtualNode;
        /**
         * A view that the system displays along with the menu.
         */
        preview?: VirtualNode;
    };
    /**
     * Sets the menu indicator visibility for controls within this view.
     */
    menuIndicator?: Visibility;
    /**
     * Set the width reserved for icons in labels.
     * Requires iOS 26+.
     */
    labelReservedIconWidth?: number;
    /**
     * Set the spacing between the icon and title in labels.
     */
    labelIconToTitleSpacing?: number;
};

type TextFieldViewProps = {
    /**
     * A Boolean value that indicates whether autocorrection is disabled for this view. The default value is true.
     */
    autocorrectionDisabled?: boolean;
    /**
     * Sets how often the shift key in the keyboard is automatically enabled.
     */
    textInputAutocapitalization?: TextInputAutocapitalization;
    /**
     * Sets the keyboard type for this view.
     */
    keyboardType?: KeyboardType;
    /**
     * Adds an action to perform when the user submits a value to this view. If you specify a function as the action, the `triggers` defaults to `text`.
     */
    onSubmit?: (() => void) | {
        /**
         * The triggers that should invoke the provided action.
         */
        triggers: SubmitTriggers;
        /**
         * The action to perform on submission of a value.
         */
        action: () => void;
    };
    /**
     * Prevents submission triggers originating from this view to invoke a submission action configured by a submission modifier higher up in the view hierarchy. A boolean that indicates whether this scope is actively blocking submission triggers from reaching higher submission actions.
     */
    submitScope?: boolean;
    /**
     * The label to use for the submit button.
     */
    submitLabel?: "continue" | "return" | "send" | "go" | "search" | "join" | "done" | "next" | "route";
};

type TextViewProps = {
    /**
     * When specify to number, will apply as system font with size. When specify to `Font`, will apply as specified system font. If you provide both `name` and `size`, will apply as custom font family and font size.
     */
    font?: Font | number | {
        /**
         * Custom font name.
         */
        name: string;
        /**
         * Custom font size.
         */
        size: number;
    };
    /**
     * Sets the font width of the text in this view.
     */
    fontWidth?: FontWidth | number;
    /**
     * One of the available font weights. Providing null removes the effect of any font weight modifier applied higher in the view hierarchy.
     */
    fontWeight?: FontWeight;
    /**
     * One of the available font designs. Providing null removes the effect of any font design modifier applied higher in the view hierarchy.
     */
    fontDesign?: FontDesign;
    /**
     * A fraction between 0 and 1 (inclusive) you use to specify the minimum amount of text scaling that this view permits.
     */
    minScaleFactor?: number;
    /**
     * Applies a bold font weight to the text in this view.
     */
    bold?: boolean;
    /**
     * Sets the vertical offset for the text relative to its baseline in this view.
     */
    baselineOffset?: number;
    /**
     * Sets the spacing, or kerning, between characters for the text in this view.
     */
    kerning?: number;
    /**
     * Applies italics to the text in this view.
     */
    italic?: boolean;
    /**
     * Modifies the fonts of all child views to use the fixed-width variant of the current font, if possible.
     */
    monospaced?: boolean;
    /**
     * Modifies the fonts of all child views to use fixed-width digits, if possible, while leaving other characters proportionally spaced.
     */
    monospacedDigit?: boolean;
    /**
     * Applies a strikethrough with a specified color to the text.
     */
    strikethrough?: Color | {
        pattern: LineStylePattern;
        color: Color;
    };
    /**
     * Applies a underline with a specified color to the text.
     */
    underline?: Color | {
        pattern: LineStylePattern;
        color: Color;
    };
    /**
     * Sets the maximum number of lines that text can occupy in this view.
     */
    lineLimit?: number | {
        min?: number;
        max: number;
        /**
         * Whether text reserves space so that it always occupies the height required to display the specified number of lines.
         */
        reservesSpace?: boolean;
    };
    /**
     * Sets the alignment of a text view that contains multiple lines of text.
     */
    multilineTextAlignment?: TextAlignment;
    /**
     * Sets the spacing between lines of text in this view.
     */
    lineSpacing?: number;
    /**
     * Sets the truncation mode for lines of text that are too long to fit in the available space.
     */
    truncationMode?: TruncationMode;
    /**
     * Sets whether text in this view can compress the space between characters when necessary to fit text in a line.
     */
    allowsTightening?: boolean;
    /**
     * Sets whether this view mirrors its contents horizontally when the layout direction is right-to-left.
     */
    flipsForRightToLeftLayoutDirection?: boolean;
    /**
     * Sets a transform for the case of the text contained in this view when displayed. The default is null.
     */
    textCase?: 'uppercase' | 'lowercase' | null;
    /**
     * Controls whether people can select text within this view.
     */
    textSelection?: boolean;
};

type ShapeViewProps = {
    /**
     * Sets the container shape to use for any container relative shape within this view.
     */
    containerShape?: Shape;
    /**
     * The resolved shape of the content to which this shape can apply.
     *
     * For example, if this shape applies an effect to a button, the `contentShape` might represent the bounding shape of that button’s background. You typically size a dynamic shape relative to the bounding rectangle of the `contentShape`.
     */
    contentShape?: Shape | {
        kind: ContentShapeKinds;
        shape: Shape | 'concentricRect' | ({
            type: 'concentricRect';
        } & ConcentricRectangleShape);
    };
    /**
     * The clipping shape to use for this view. The shape fills the view’s frame, while maintaining its aspect ratio.
     */
    clipShape?: Shape | 'concentricRect' | ({
        type: 'concentricRect';
    } & ConcentricRectangleShape);
    /**
     * Clips this view to its bounding rectangular frame. If specify `null` or `undefined`, this modifier will be ignored. Specify a boolean value that indicates whether the rendering system applies smoothing to the edges of the clipping rectangle.
     */
    clipped?: boolean;
};

type ChartViewProps = {
    /**
     * Sets the visibility of the x axis.
     */
    chartXAxis?: Visibility;
    /**
     * Sets the visibility of the y axis.
     */
    chartYAxis?: Visibility;
    /**
     * Adds x axis label for charts in the view.
     */
    chartXAxisLabel?: {
        position?: AnnotationPosition;
        alignment?: Alignment;
        spacing?: number;
        content: VirtualNode;
    };
    /**
     * Adds y axis label for charts in the view.
     */
    chartYAxisLabel?: {
        position?: AnnotationPosition;
        alignment?: Alignment;
        spacing?: number;
        content: VirtualNode;
    };
    /**
     * Configures the legend for charts.
     */
    chartLegend?: Visibility | {
        position: AnnotationPosition;
        alignment?: Alignment;
        spacing?: number;
        content?: VirtualNode;
    };
    /**
     * Configures the x scale for charts.
     */
    chartXScale?: ClosedRange<number> | ClosedRange<Date> | string[] | ChartAxisScaleType | {
        /**
         * The possible data values along the x axis in the chart. You can define the domain with a ClosedRange for number or Date values (e.g., {from: 0, to: 500}), and with an array for string values (e.g., ["A", "B", "C"])
         */
        domain: ClosedRange<number> | ClosedRange<Date> | string[];
        /**
         * The scale type.
         */
        type: ChartAxisScaleType;
    };
    /**
     * Configures the y scale for charts.
     */
    chartYScale?: ClosedRange<number> | ClosedRange<Date> | string[] | ChartAxisScaleType | {
        /**
         * The possible data values along the y axis in the chart. You can define the domain with a ClosedRange for number or Date values (e.g., {from: 0, to: 500}), and with an array for string values (e.g., ["A", "B", "C"])
         */
        domain: ClosedRange<number> | ClosedRange<Date> | string[];
        /**
         * The scale type.
         */
        type: ChartAxisScaleType;
    };
    /**
     * Adds a background to a view that contains a chart.
     */
    chartBackground?: VirtualNode | {
        /**
         * The alignment of the content.
         */
        alignment: Alignment;
        /**
         * The content of the background.
         */
        content: VirtualNode;
    };
    /**
     * For many charts, the default configuration works well. However, in this case, the colors that the framework assigns to each mark don’t match the shape colors that they represent.
     * You can customize the chart to override the default color scale by adding this property.
     */
    chartForegroundStyleScale?: Record<string, ShapeStyle | DynamicShapeStyle>;
    /**
     * Configures the symbol style scale for charts.
     */
    chartSymbolScale?: Record<string, ChartSymbolShape>;
    /**
     * Configures the symbol size scale for charts.
     */
    chartSymbolSizeScale?: Record<string, number>;
    /**
     * Configures the line style scale for charts.
     */
    chartLineStyleScale?: Record<string, StrokeStyle>;
    /**
     * The set of chart axes to enable scrolling.
     */
    chartScrollableAxes?: AxisSet;
    chartXSelection?: ChartSelection;
    chartYSelection?: ChartSelection;
    chartAngleSelection?: ChartSelection;
    /**
     * The length of the visible domain measured in data units. For categorical data, this should be the number of visible categories.
     *
     * When the `label` type of the chart marks is `Date`, this number should be fixed with your `unit`! See [Swift Charts' chartXVisibleDomain hangs or crashes](https://stackoverflow.com/questions/77236097/swift-charts-chartxvisibledomain-hangs-or-crashes)
     */
    chartXVisibleDomain?: number;
    /**
     * The length of the visible domain measured in data units. For categorical data, this should be the number of visible categories.
     *
     * When the `label` type of the chart marks is `Date`, this number should be fixed with your `unit`! See [Swift Charts' chartXVisibleDomain hangs or crashes](https://stackoverflow.com/questions/77236097/swift-charts-chartxvisibledomain-hangs-or-crashes)
     */
    chartYVisibleDomain?: number;
    /**
     * Sets the initial scroll position along the x-axis if you provide a `string`, `number` or `Date` value. Once the user scrolls the scroll view, the value provided to this modifier will have no effect. Specify an object with `value` and `onChange` will associate a binding to be updated when the chart scrolls along the x-axis.
     */
    chartScrollPositionX?: number | string | Date | ChartScrollPosition<string> | ChartScrollPosition<number> | ChartScrollPosition<Date> | Observable<number> | Observable<string> | Observable<Date>;
    /**
     * Sets the initial scroll position along the y-axis if you provide a `string`, `number` or `Date` value. Once the user scrolls the scroll view, the value provided to this modifier will have no effect. Specify an object with `value` and `onChange` will associate a binding to be updated when the chart scrolls along the y-axis.
     */
    chartScrollPositionY?: number | string | Date | ChartScrollPosition<string> | ChartScrollPosition<number> | ChartScrollPosition<Date> | Observable<number> | Observable<string> | Observable<Date>;
};

/**
 * A kind of toolbar item a View adds by default.
 *  - `sidebarToggle`: The sidebar toggle toolbar item a NavigationSplitView adds by default.
 *  - `search`: The search item added by a `searchable` modifier.
 *  - `title`: The title and subtitle shown in title bar / navigation bar.
 */
type ToolbarDefaultItemKind = "sidebarToggle" | "search" | "title";
type DefaultToolbarItemProps = {
    kind: ToolbarDefaultItemKind;
    /**
     * Defaults to `automatic`.
     */
    placement?: ToolbarItemPlacement;
    /**
     * Controls the visibility of the glass background effect on items in the toolbar. In certain contexts, such as the navigation bar on iOS and the window toolbar on macOS, toolbar items will be given a glass background effect that is shared with other items in the same logical grouping.
     */
    sharedBackgroundVisibility?: Visibility;
};
declare const DefaultToolbarItem: FunctionComponent<DefaultToolbarItemProps>;

type ToolbarsProps = {
    /**
     * Controls the visibility of bottom bar.
     */
    bottomBarVisibility?: Visibility;
    /**
     * Controls the visibility of navigation bar.
     */
    navigationBarVisibility?: Visibility;
    /**
     * Controls the visibility of tab bar.
     */
    tabBarVisibility?: Visibility;
    /**
     * Populates the toolbar or navigation bar with the specified items.
     * @example
     * ```tsx
     * <List
     *   toolbar={<Toolbar>
     *     <ToolbarItem
     *       placement="topBarLeading"
     *     >
     *       <Button
     *         title="Close"
     *         action={dismiss}
     *       />
     *     </ToolbarItem>
     *   </Toolbar>}
     * >
     *  ...
     * </List>
     * ```
     */
    toolbar?: ToolBarProps | VirtualNode;
    /**
     * This will construct a menu that can be presented by tapping the navigation title in the app’s navigation bar.
     */
    toolbarTitleMenu?: VirtualNode;
    /**
     * Specifies the preferred shape style of the background of the tabbar
     */
    toolbarBackground?: ShapeStyle | DynamicShapeStyle | {
        style: ShapeStyle | DynamicShapeStyle;
        bars?: ToolbarPlacement[];
    };
    /**
     * (iOS 18.0+) Specifies the preferred visibility of backgrounds on a bar.
     */
    toolbarBackgroundVisibility?: Visibility | {
        /**
         * The preferred visibility of the background of the bar.
         */
        visibility: Visibility;
        /**
         * The bars to update the color scheme of or automatic if empty.
         */
        bars?: ToolbarPlacement[];
    };
    /**
     * Specifies the preferred color scheme of a bar.
     */
    toolbarColorScheme?: ColorScheme | {
        /**
         * The preferred color scheme of the background of the bar.
         */
        colorScheme: ColorScheme | null;
        /**
         * The bars to update the color scheme of or automatic if empty.
         */
        bars?: ToolbarPlacement[];
    };
    /**
     * Configures the toolbar title display mode for this view.
     */
    toolbarTitleDisplayMode?: ToolbarTitleDisplayMode;
    /**
     * Remove the specified toolbar items present by default.
     */
    toolbarRemoving?: {
        [K in ToolbarDefaultItemKind]?: boolean;
    };
    /**
     * Configures the semantic role for the content populating the toolbar.
     */
    toolbarRole?: 'automatic' | 'browser' | 'editor' | 'navigationStack';
    /**
     * Sets the behavior for tab bar minimization.
     * @available iOS 26.0+
     */
    tabBarMinimizeBehavior?: 'automatic' | 'never' | 'onScrollDown' | 'onScrollUp';
    /**
     * Places a view as the bottom accessory of the tab view.
     * @available iOS 26.0+
     */
    tabViewBottomAccessory?: VirtualNode;
    /**
     * Configures the activation and deactivation behavior of search in the search tab.
     * @available iOS 26.0+
     */
    tabViewSearchActivation?: 'automatic' | 'searchTabSelection';
    /**
     * Specifies the customizations to apply to the sidebar representation of the tab view.
     * @available iOS 18.0+
     */
    tabViewCustomization?: Observable<TabViewCustomization>;
    /**
     * Places a view as the header of the sidebar tab view.
     * @available iOS 18.0+
     */
    tabViewSidebarHeader?: VirtualNode;
    /**
     * Places a view as the footer of the sidebar tab view.
     * @available iOS 18.0+
     */
    tabViewSidebarFooter?: VirtualNode;
    /**
     * Places a view as the bottom bar of the sidebar tab view.
     * @available iOS 18.0+
     */
    tabViewSidebarBottomBar?: VirtualNode;
    /**
     * Sets the style for the index view within the current environment.
     */
    indexViewStyle?: IndexViewStyle;
};

/**
 * - `hard`: A scroll edge effect with a hard cutoff and dividing line.
 * - `soft`: A scroll edge effect with a soft edge.
 */
type ScrollEdgeEffectStyle = "automatic" | "hard" | "soft";
type ScrollProps = {
    /**
     * Marks this view as refreshable. An asynchronous handler that framework executes when the user requests a refresh. Use this handler to initiate an update of model data displayed in the modified view. Use await in front of any asynchronous calls inside the handler.
     */
    refreshable?: () => Promise<void>;
    /**
     * Use this modifier to hide or show scroll indicators on scrollable content in views like a `ScrollView` or `List`. This modifier applies the prefered visibility to any scrollable content within a view hierarchy.
     */
    scrollIndicator?: ScrollScrollIndicatorVisibility | {
        /**
         * The visibility to apply to scrollable views.
         */
        visibility: ScrollScrollIndicatorVisibility;
        /**
         * The axes of scrollable views that the visibility applies to.
         */
        axes: AxisSet;
    };
    /**
     * Disables or enables scrolling in scrollable views.
     */
    scrollDisabled?: boolean;
    /**
     * Sets whether a scroll view clips its content to its bounds.
     */
    scrollClipDisabled?: boolean;
    /**
     * Configures the behavior in which scrollable content interacts with the software keyboard.
     */
    scrollDismissesKeyboard?: ScrollDismissesKeyboardMode;
    /**
     * Use this modifier to specify an anchor to control both which part of the scroll view’s content should be visible initially and how the scroll view handles content size changes.
     */
    defaultScrollAnchor?: KeywordPoint | Point;
    /**
     * Apply this modifier to layout containers like `LazyHStack` or `VStack` within a `ScrollView` that contain the main repeating content of your `ScrollView`.
     */
    scrollTargetlayout?: boolean;
    /**
     * Sets the scroll behavior of views scrollable in the provided axes.
     */
    scrollTargetBehavior?: ScrollTargetBehavior;
    /**
     * Specifies the visibility of the background for scrollable views within this view.
     */
    scrollContentBackground?: Visibility;
    /**
     * Configures the scroll edge effect style for scroll views within this hierarchy.
     * @available iOS 26.0+
     */
    scrollEdgeEffectStyle?: EdgeSet | ScrollEdgeEffectStyle | {
        style: ScrollEdgeEffectStyle;
        edges: EdgeSet;
    };
    /**
     * Hides any scroll edge effects for scroll views within this hierarchy.
     * @available iOS 26.0+
     */
    scrollEdgeEffectHidden?: boolean | EdgeSet | {
        edges: EdgeSet;
        hidden: boolean;
    };
};

type SafeAreaProps = {
    /**
     * Adds the provided insets into the safe area of this view. Use this modifier when you would like to add a fixed amount of space to the safe area a view sees.
     * When specify to true, will apply the default padding.
     */
    safeAreaPadding?: true | number | {
        horizontal?: number | true;
        vertical?: number | true;
        leading?: number | true;
        trailing?: number | true;
        top?: number | true;
        bottom?: number | true;
    };
    /**
     * Shows the specified content beside the modified view.
     */
    safeAreaInset?: {
        top?: {
            /**
             * The alignment guide used to position content horizontally.
             */
            alignment?: HorizontalAlignment;
            /**
             * Extra distance placed between the two views, or nil to use the default amount of spacing.
             */
            spacing?: number;
            /**
             * The view to display in the inset space of the modified view.
             */
            content: VirtualNode;
        };
        bottom?: {
            /**
             * The alignment guide used to position content horizontally.
             */
            alignment?: HorizontalAlignment;
            /**
             * Extra distance placed between the two views, or nil to use the default amount of spacing.
             */
            spacing?: number;
            /**
             * The view to display in the inset space of the modified view.
             */
            content: VirtualNode;
        };
        leading?: {
            /**
             * The alignment guide used to position content vertically.
             */
            alignment?: VerticalAlignment;
            /**
             * Extra distance placed between the two views, or nil to use the default amount of spacing.
             */
            spacing?: number;
            /**
             * The view to display in the inset space of the modified view.
             */
            content: VirtualNode;
        };
        trailing?: {
            /**
             * The alignment guide used to position content vertically.
             */
            alignment?: VerticalAlignment;
            /**
             * Extra distance placed between the two views, or nil to use the default amount of spacing.
             */
            spacing?: number;
            /**
             * The view to display in the inset space of the modified view.
             */
            content: VirtualNode;
        };
    };
    /**
     * Expands the safe area of a view.
     */
    ignoresSafeArea?: boolean | {
        /**
         * The regions to expand the view’s safe area into. The modifier expands into all safe area region types by default.
         */
        regions?: SafeAreaRegions;
        /**
         * The set of edges to expand. Any edges that you don’t include in this set remain unchanged. The set includes all edges by default.
         */
        edges?: EdgeSet;
    };
    /**
     * Shows the specified content as a custom bar beside the modified view.
     * @available iOS 26.0+
     */
    safeAreaBar?: {
        edge: HorizontalEdge;
        alignment?: VerticalAlignment;
        spacing?: number | null;
        content: VirtualNode;
    } | {
        edge: VerticalEdge;
        alignment?: HorizontalAlignment;
        spacing?: number | null;
        content: VirtualNode;
    };
};

type WidgetProps = {
    /**
     * The URL to open in the containing app when the user clicks the widget. Widgets support one `widgetURL` modifier in their view hierarchy. If multiple views have widgetURL modifiers, the behavior is undefined. If you want to add URL for multiple views, use `Link` view to wrap them.
     */
    widgetURL?: string;
    /**
     * Adds the view and all of its subviews to the accented group.
     *
     * When the system renders the widget using the WidgetKit/WidgetRenderingMode/accented mode, it divides the widget’s view hierarchy into two groups: the accented group and the default group. It then applies a different color to each group.
     *
     * When applying the colors, the system treats the widget’s views as if they were template images. It ignores the view’s color — rendering the new colors based on the view’s alpha channel.
     *
     * To control your view’s appearance, add the `widgetAccentable` modifier to part of your view’s hierarchy. If the accentable parameter is true, the system adds that view and all of its subviews to the accent group. It puts all other views in the default group.
     *
     * @example
     * ```tsx
     * <VStack>
     *   <Text
     *     widgetAccentable
     *     font="caption"
     *   >MON</Text>
     *   <Text
     *     font="title"
     *   >6</Text>
     * </VStack>
     * ```
     */
    widgetAccentable?: boolean;
    /**
     * This view modifier is used in widgets to set the background of views. When a widget is rendered in `accented` mode, the system displays all colors as white (or as the tinted color if `widgetAccentable` is applied to the view). By using this modifier, the background will be hidden in `accented` mode but will appear normally in all other modes.
     */
    widgetBackground?: ShapeStyle | DynamicShapeStyle | {
        style: ShapeStyle | DynamicShapeStyle;
        shape: Shape | 'concentricRect' | ({
            type: 'concentricRect';
        } & ConcentricRectangleShape);
    };
};

type ExtensionProps = {
    /**
     * Defines the animation configuration for swinging the view along the X and/or Y axis. Each axis can have its own animation settings:
     *
     *  - x: The animation configuration for the horizontal axis.
     *  - y: The animation configuration for the vertical axis.
     *
     * @example
     * ```tsx
     * <Circle
     *   fill="systemRed"
     *   frame={{width: 50, height: 50}}
     *   swingAnimation={{
     *     x: {
     *       duration: 4,
     *       distance: 250
     *     },
     *     y: {
     *       duration: 2,
     *       distance: 50
     *     }
     *   }}
     * />
     * ```
     */
    swingAnimation?: {
        /**
         * The horizontal axis animation.
         */
        x?: SwingAnimation;
        /**
         * The vertical axis animation.
         */
        y?: SwingAnimation;
    };
    /**
     * Defines the rotation effect for simulating a clock hand. You can specify the anchor point (optional) and the period (e.g., "hourHand", "minuteHand", "secondHand"), or provide a custom duration for the rotation.
     */
    clockHandRotationEffect?: ClockHandRotationEffectPeriod | {
        anchor: KeywordPoint | Point;
        period: ClockHandRotationEffectPeriod;
    };
    /**
     * Provides a host for translation service. This should be applied to the root view of your current page.
     *
     * Why use a translation host?
     *
     * - If the source or target language aren’t installed, the framework asks the person for permission to download the languages.
     * - If the source parameter is null and the framework can’t detect the source language from the content, the framework prompts the person to choose the source language.
     *
     * @example
     * ```tsx
     * function View() {
     *   const translation = useMemo(() => new Translation(), [])
     *   const [translated, setTranslated] = useState<{[key: string]: string}>({})
     *   const texts = ["Hello", "Goodbye"]
     *
     *   useEffect(() => {
     *     translation.translateBatch({
     *       texts,
     *       target: "fr",
     *       source: "en"
     *     }).then(result => {
     *       const map: {[key: string]: string} = {}
     *       result.forEach((item, index) => {
     *         map[texts[index]] = item
     *       })
     *       setTranslated(map)
     *     })
     *   }, [])
     *
     *
     *   return <VStack
     *     translationHost={translation}
     *   >
     *    {texts.map(text => (
     *       <Text key={text}>
     *         {translated[text] || text}
     *       </Text>
     *     ))}
     *   </VStack>
     * }
     * ```
     */
    translationHost?: Translation;
};

type ViewAppearProps = {
    /**
     * The exact moment that framework calls this method depends on the specific view type that you apply it to, but the action closure completes before the first rendered frame appears.
     */
    onAppear?: () => void;
    /**
     * The exact moment that framework calls this method depends on the specific view type that you apply it to, but the action closure doesn’t execute until the view disappears from the interface.
     */
    onDisappear?: () => void;
};

type GridViewProps = {
    /**
     * Tells a view that acts as a cell in a grid to span the specified number of columns.
     */
    gridCellColumns?: number;
    /**
     * Specifies a custom alignment anchor for a view that acts as a grid cell.
     */
    gridCellAnchor?: KeywordPoint | Point;
    /**
     * Asks grid layouts not to offer the view extra size in the specified axes.
     */
    gridCellUnsizedAxes?: AxisSet;
    /**
     * Overrides the default horizontal alignment of the grid column that the view appears in.
     */
    gridColumnAlignment?: HorizontalAlignment;
};

type ModalPresentationViewProps = {
    /**
     * A Boolean value that indicates whether to prevent nonprogrammatic dismissal of the containing view hierarchy when presented in a sheet or popover.
     */
    interactiveDismissDisabled?: boolean;
    /**
     * Presents a popover when the `isPresented` condition is true. Register multiple modals by specify an array of `ModalPresentation`.
     */
    popover?: PopoverPresentation | PopoverPresentation[];
    /**
     * Presents a sheet when the `isPresented` that you provide is true. Register multiple modals by specify an array of `ModalPresentation`.
     */
    sheet?: ModalPresentation | ModalPresentation[];
    /**
     * Presents a modal view that covers as much of the screen as possible when the `isPresented` that you provide is true. Register multiple modals by specify an array of `ModalPresentation`.
     */
    fullScreenCover?: ModalPresentation | ModalPresentation[];
    /**
     * The adaptation to use in either a horizontally or vertically compact size class.
     * Some presentations adapt their appearance depending on the context. For example, a sheet presentation over a vertically-compact view uses a full-screen-cover appearance by default.
     */
    presentationCompactAdaptation?: PresentationAdaptation | {
        /**
         * The adaptation to use in a horizontally compact size class.
         */
        horizontal: PresentationAdaptation;
        /**
         * The adaptation to use in a vertically compact size class. In a size class that is both horizontally and vertically compact, system uses the verticalAdaptation value.
         */
        vertical: PresentationAdaptation;
    };
    /**
     * Sets the visibility of the drag indicator on top of a sheet.
     */
    presentationDragIndicator?: Visibility;
    /**
     * A set of supported detents for the sheet. If you provide more that one detent, people can drag the sheet to resize it.
     */
    presentationDetents?: PresentationDetent[];
    /**
     * A specification of how people can interact with the view behind a presentation.
     */
    presentationBackgroundInteraction?: PresentationBackgroundInteraction;
    /**
     * By default, when a person swipes up on a scroll view in a resizable presentation, the presentation grows to the next detent. A scroll view embedded in the presentation only scrolls after the presentation reaches its largest size. Use this modifier to control which action takes precedence.
     */
    presentationContentInteraction?: PresentationContentInteraction;
    /**
     * Requests that the presentation have a specific corner radius.
     */
    presentationCornerRadius?: number;
};

type TransformAndEffectProps = {
    /**
     * Override the default accent color for this view with a given styling. Unlike an app’s accent color, which can be overridden by user preference, tint is always respected and should be used as a way to provide additional meaning to the control.
     */
    tint?: ShapeStyle | DynamicShapeStyle;
    /**
     * Sets the transparency of this view.
     */
    opacity?: number;
    /**
     * Inverts the colors in this view.
     */
    colorConvert?: boolean;
    /**
     * Controls the display order of overlapping views.
     * A relative front-to-back ordering for this view; the default is 0.
     */
    zIndex?: number;
    /**
     * Layers the views that you specify in front of this view.
     */
    overlay?: VirtualNode | {
        alignment: Alignment;
        content: VirtualNode;
    };
    /**
     * Masks this view using the alpha channel of the given view.
     */
    mask?: VirtualNode | {
        alignment: Alignment;
        content: VirtualNode;
    };
    /**
     * Positions the center of this view at the specified coordinates in its parent’s coordinate space.
     */
    position?: {
        /**
         * The x-coordinate at which to place the center of this view.
         */
        x: number;
        /**
         * The y-coordinate at which to place the center of this view.
         */
        y: number;
    };
    /**
     * Offset this view by the specified horizontal and vertical distances.
     */
    offset?: {
        /**
         * The horizontal distance to offset this view.
         */
        x: number;
        /**
         * The vertical distance to offset this view.
         */
        y: number;
    };
    /**
     * Rotates a view’s rendered output in two dimensions around the specified point.
     */
    rotationEffect?: number | {
        degrees: number;
        /**
         * A unit point within the view about which to perform the rotation. The default value is `center`.
         */
        anchor: KeywordPoint | Point;
    };
    /**
     * Scales this view’s rendered output by the given horizontal and vertical amounts, relative to an anchor point.
     */
    scaleEffect?: number | {
        x: number;
        y: number;
        anchor?: KeywordPoint | Point;
    };
    /**
     * Adds a shadow to this view.
     */
    shadow?: {
        /**
         * The shadow’s color.
         */
        color: Color;
        /**
         * A measure of how much to blur the shadow. Larger values result in more blur.
         */
        radius: number;
        /**
         * An amount to offset the shadow horizontally from the view.
         */
        x?: number;
        /**
         * An amount to offset the shadow vertically from the view.
         */
        y?: number;
    };
    /**
     * Applies a Gaussian blur to this view.
     */
    blur?: number | {
        /**
         * The radial size of the blur. A blur is more diffuse when its radius is large.
         */
        radius: number;
        /**
         * A Boolean value that indicates whether the blur renderer permits transparency in the blur output. Set to true to create an opaque blur, or set to false to permit transparency.
         */
        opaque: boolean;
    };
};

type NavigationProps = {
    /**
     * A background placement inside a NavigationStack. (iOS 18.0+)
     */
    navigationContainerBackground?: ShapeStyle | DynamicShapeStyle | VirtualNode;
    /**
     * A background placement inside a NavigationSplitView. (iOS 18.0+)
     */
    navigationSplitViewContainerBackground?: ShapeStyle | DynamicShapeStyle | VirtualNode;
    /**
     * Sets a fixed, preferred width for the column containing this view.
     */
    navigationSplitViewColumnWidth?: number | {
        min?: number;
        ideal: number;
        max?: number;
    };
    /**
     * Sets the style for navigation split views within this view.
     */
    navigationSplitViewStyle?: NavigationSplitViewStyle;
    /**
     * Associates a destination view with a binding that can be used to push the view onto a NavigationStack.
     */
    navigationDestination?: {
        /**
         * A view to present.
         */
        content: VirtualNode;
    } & ({
        isPresented: boolean;
        onChanged: (isPresented: boolean) => void;
    } | {
        isPresented: Observable<boolean>;
        onChanged?: never;
    });
    /**
     * Configures the view’s title for purposes of navigation.
     * On iOS, when a view is navigated to inside of a navigation view, that view’s title is displayed in the navigation bar.
     * On iPadOS, the primary destination’s navigation title is reflected as the window’s title in the App Switcher.
     */
    navigationTitle?: string;
    /**
     * Configures the view’s subtitle for purposes of navigation.
     * @available iOS 26.0+
     */
    navigationSubtitle?: string;
    /**
     * The style to use for displaying the title.
     */
    navigationBarTitleDisplayMode?: NavigationBarTitleDisplayMode;
    /**
     * Hides the navigation bar back button for the view.
     */
    navigationBarBackButtonHidden?: boolean;
    /**
     * Sets the navigation transition style for this view.
     * @available iOS 18.0+
     */
    navigationTransition?: 'automatic' | {
        type: 'zoom';
        sourceID: string | number;
        namespace: NamespaceID;
    };
    /**
     * Sets the tab bar item associated with this view.
     */
    tabItem?: VirtualNode;
};

type ListViewProps = {
    /**
     * Generates a badge for the view from an integer or a string value.
     */
    badge?: number | string;
    /**
     * Specifies the prominence of badges created by this view.
     */
    badgeProminence?: BadgeProminence;
    /**
       * The color to use to tint the content. Use null to avoid overriding the inherited tint.
       */
    listItemTint?: Color;
    /**
     * Applies an inset to the rows in a list.
     */
    listRowInsets?: number | EdgeInsets;
    /**
     * Sets the vertical spacing between two adjacent rows in a List.
     */
    listRowSpacing?: number;
    /**
     * Sets the display mode for the separator associated with this specific row.
     */
    listRowSeparator?: Visibility | {
        /**
         * The visibility of this row’s separators.
         */
        visibility: Visibility;
        /**
         * The set of row edges for which this preference applies. The list style might already decide to not display separators for some edges, typically the top edge. The default is all.
         */
        edges: VerticalEdgeSet;
    };
    /**
     * Sets the tint color associated with a row.
     */
    listRowSeparatorTint?: Color | {
        /**
         * The color to use to tint the row separators, or null to use the default color for the current list style.
         */
        color: Color;
        /**
         * The set of row edges for which the tint applies. The list style might decide to not display certain separators, typically the top edge. The default is all.
         */
        edges: VerticalEdgeSet;
    };
    /**
     * Sets the spacing between adjacent sections in a List to a custom value.
     */
    listSectionSpacing?: ListSectionSpacing;
    /**
     * Sets whether to hide the separator associated with a list section.
     */
    listSectionSeparator?: Visibility | {
        /**
         * The visibility of this section’s separators.
         */
        visibility: Visibility;
        /**
         * The set of row edges for which the preference applies. The list style might already decide to not display separators for some edges. The default is all.
         */
        edges: VerticalEdgeSet;
    };
    /**
     * Sets the tint color associated with a section.
     */
    listSectionSeparatorTint?: Color | {
        /**
         * The color to use to tint the section separators, or nil to use the default color for the current list style.
         */
        color: Color;
        /**
         * The set of row edges for which the tint applies. The list style might decide to not display certain separators, typically the top edge. The default is all.
         */
        edges: VerticalEdgeSet;
    };
    /**
     * Places a custom background view behind a list row item.
     */
    listRowBackground?: VirtualNode;
    /**
     * Configures the content margin for a provided placement.
     */
    contentMargins?: EdgeInsets | number | {
        /**
         * The edges to add the margins to.
         */
        edges?: EdgeSet;
        /**
         * The amount of margins to add.
         */
        insets: EdgeInsets | number;
        /**
         * Where the margins should be added.
         */
        placement?: ContentMarginPlacement;
    };
    /**
     * Sets the visibility of the list section index.
     * @available iOS 26.0+.
     */
    listSectionIndexVisibility?: Visibility;
    /**
     * Set the section margins for the specific edges.
     * The default section margins are based on the list style, list section spacing and content margins of the list. Using this modifier overrides these default values completely.
     *
     * For sections that have headers or footers, the section margins are applied around these.
     * @available iOS 26.0+.
     */
    listSectionMargins?: number | EdgeSet | {
        edges: EdgeSet;
        length: number;
    };
    /**
     * Sets the label that is used in a section index to point to this section, typically only a single character long.
     * @available iOS 26.0+.
     */
    sectionIndexLabel?: string;
    /**
     * Adds custom actions to a section.
     * @available iOS 18.0+
     */
    sectionActions?: VirtualNode;
};

type EditActionsProps = {
    /**
     * Adds a condition for whether the view’s view hierarchy is movable.
     */
    moveDisabled?: boolean;
    /**
     * Adds a condition for whether the view’s view hierarchy is deletable.
     */
    deleteDisabled?: boolean;
    /**
     * Adds a condition that controls whether users can select this view.
     */
    selectionDisabled?: boolean;
    /**
     * Use this property to add leading swipe actions to a view that acts as a row in a list.
     */
    leadingSwipeActions?: {
        /**
         * A Boolean value that indicates whether a full swipe automatically performs the first action. The default is true.
         */
        allowsFullSwipe?: boolean;
        /**
         * The content of the swipe actions.
         */
        actions: VirtualNode[];
    };
    /**
     * Use this property to add trailing swipe actions to a view that acts as a row in a list.
     */
    trailingSwipeActions?: {
        /**
         * A Boolean value that indicates whether a full swipe automatically performs the first action. The default is true.
         */
        allowsFullSwipe?: boolean;
        /**
         * The content of the swipe actions.
         */
        actions: VirtualNode[];
    };
};

type SymbolProps = {
    /**
     * Sets the rendering mode for symbol images within this view.
     */
    symbolRenderingMode?: SymbolRenderingMode;
    /**
     * Makes symbols within the view show a particular variant.
     */
    symbolVariant?: SymbolVariants;
    /**
     * Add a symbol effect to the view.
     */
    symbolEffect?: SymbolEffect;
};

type TransitionProps = {
    /**
     * The transition to apply when animating the content change.
     */
    contentTransition?: ContentTransition;
    /**
     * The transition to apply when animating the view.
     */
    transition?: Transition;
    /**
     * Isolates the geometry (e.g. position and size) of the view from its parent view.
     */
    geometryGroup?: boolean;
    /**
     * Identifies this view as the source of a navigation transition, such as a zoom transition.
     * @available iOS 18.0+
     */
    matchedTransitionSource?: {
        id: string | number;
        namespace: NamespaceID;
    };
    /**
     * Defines a group of views with synchronized geometry using an identifier and namespace that you provide.
     *  - `id`: The identifier, often derived from the identifier of the data being displayed by the view.
     *  - `namespace`: The namespace in which defines the id. New namespaces are created by `NamespaceReader` views.
     *  - `properties`: The properties to copy from the source view. Defaults to 'frame'.
     *  - `anchor`: The relative location in the view used to produce its shared position value. Defaults to 'center'.
     *  - `isSource`: True if the view should be used as the source of geometry for other views in the group. Defaults to true.
     */
    matchedGeometryEffect?: {
        id: string | number;
        namespace: NamespaceID;
        properties?: MatchedGeometryProperties;
        anchor?: Point | KeywordPoint;
        isSource?: boolean;
    };
};

/**
 * The reasons to apply a redaction to data displayed on screen.
 *  - `placeholder`: Displayed data should appear as generic placeholders.
 *  - `invalidated`: Displayed data should appear as invalidated and pending a new update.
 *  - `privacy`: Displayed data should be obscured to protect private information.
 */
type RedactedReason = "placeholder" | "invalidated" | "privacy";

type DialogProps = {
    toast?: {
        /**
         * The duration of the toast in seconds. Defaults to 2.
         */
        duration?: number | null;
        /**
         * The position of the toast. Defaults to `bottom`.
         */
        position?: "top" | "bottom" | "center";
        /**
         * The background color of the toast.
         */
        backgroundColor?: Color | null;
        /**
         * The text color of the toast.
         */
        textColor?: Color | null;
        /**
         * The corner radius of the toast. Defaults to 16.
         */
        cornerRadius?: number | null;
        /**
         * The shadow color of the toast. Defaults to 4.
         */
        shadowRadius?: number | null;
    } & ({
        message: string;
        content?: never;
    } | {
        message?: never;
        content: VirtualNode;
    }) & ({
        /**
         * An observable Boolean value that determines whether to present the toast. When the user presses or taps one of the toast’s actions, the system sets this value to false and dismisses.
         */
        isPresented: Observable<boolean>;
    } | {
        /**
         * A Boolean value that determines whether to present the toast. When the user presses or taps one of the toast’s actions, the system sets this value to false and dismisses.
         */
        isPresented: boolean;
        onChanged: (isPresented: boolean) => void;
    });
    /**
     * Presents an alert with a message when a given condition is true using a string variable as a title.
     */
    alert?: {
        /**
         * A text string used as the title of the alert.
         */
        title: string;
        /**
         * The alert’s actions.
         */
        actions: VirtualNode;
        /**
         * The message for the alert.
         */
        message?: VirtualNode;
    } & ({
        /**
         * A Boolean value that determines whether to present the alert. When the user presses or taps one of the alert’s actions, the system sets this value to false and dismisses.
         */
        isPresented: boolean;
        /**
         * A callback when the `isPresented` changed. You must update `isPresented` value when the user make the alert dismissed.
         */
        onChanged: (isPresented: boolean) => void;
    } | {
        isPresented: Observable<boolean>;
    });
    /**
     * Presents a confirmation dialog with a message when a given condition is true, using a string variable for the title.
     */
    confirmationDialog?: {
        /**
         * A text string used as the title of the dialog.
         */
        title: string;
        /**
         * The visibility of the dialog’s title. The default value is `automatic`.
         */
        titleVisibility?: Visibility;
        /**
         * The dialog’s actions.
         */
        actions: VirtualNode;
        /**
         * The message for the dialog.
         */
        message?: VirtualNode;
    } & ({
        /**
         * A Boolean value hat determines whether to present the dialog. When the user presses or taps the dialog’s default action button, the system sets this value to false, dismissing the dialog.
         */
        isPresented: boolean;
        /**
         * A callback when the `isPresented` changed. You must update `isPresented` value when the user make the alert dismissed.
         */
        onChanged: (isPresented: boolean) => void;
    } | {
        isPresented: Observable<boolean>;
    });
};

type SearchableProps = {
    /**
       * Marks this view as searchable, which configures the display of a search field.
       */
    searchable?: {
        /**
         * The preferred placement of the search field within the containing view hierarchy.
         */
        placement?: SearchFieldPlacement;
        /**
         * The prompt of the search field which provides users with guidance on what to search for.
         */
        prompt?: string;
        /**
         * The presented state of the search field. When the user taps the search field, the system sets this value to true and presents the search field.
         * When the user taps the search field’s cancel button, the system sets this value to false and dismisses the search field.
         */
        presented?: {
            /**
             * A Boolean value that indicates whether the search field is presented.
             */
            value: boolean;
            /**
             * A callback when the `presented` value changed.
             * You must update `presented.value` when the user make the search field dismissed.
             * @param value A Boolean value that indicates whether the search field is presented.
             */
            onChanged: (value: boolean) => void;
        } | Observable<boolean>;
    } & ({
        /**
         * The text to display and edit in the search field.
         */
        value: string;
        /**
         * The text changed callback.
         */
        onChanged: (value: string) => void;
    } | {
        value: Observable<string>;
        onChanged?: never;
    });
    /**
     * A view that produces content that populates a list of suggestions.
     */
    searchSuggestions?: VirtualNode;
    /**
     * Configures how to display search suggestions within this view.
     */
    searchSuggestionsVisibility?: {
        /**
         * The visibility of the search suggestions for the specified locations.
         */
        visibility: Visibility;
        /**
         * The set of locations in which to set the visibility of search suggestions.
         */
        placements: SearchSuggestionsPlacementSet;
    };
    /**
     * Associates a fully formed string with the value of this view when used as a search suggestion.
     */
    searchCompletion?: string;
    /**
     * Configures the behavior for search in the toolbar.
     * - `minimize`: A search toolbar behavior that prefers rendering a search field as a button-like control.
     */
    searchToolbarBehavior?: 'automatic' | 'minimize';
};

type ViewAnimationProps = {
    animation?: {
        animation: Animation;
        value: boolean | string | number;
    };
};

type LiveActivityProps = {
    /**
     * Sets the tint color for the background of a Live Activity that appears on the Lock Screen.
     */
    activityBackgroundTint?: Color | {
        light: Color;
        dark: Color;
    };
    /**
     * The text color for the auxiliary action button that the system shows next to a Live Activity on the Lock Screen.
     */
    activitySystemActionForegroundColor?: Color | {
        light: Color;
        dark: Color;
    };
};

type EnvironmentsProps = {
    environments?: {
        /**
         * Sets the edit mode of the environment.
         * @example
         * ```tsx
         * const editMode = useObservable(() => EditMode.active())
         * <List
         *   environments={{
         *     editMode: editMode
         *   }}
         * >
         *   <ForEach
         *     editActions="all"
         *     data={items}
         *     builder={item => <Text key={item.id}>{item}</Text>}
         *   />
         * </List>
         * ```
         */
        editMode?: Observable<EditMode>;
        /**
         * Sets a custom open URL action for the environment.
         * @example
         * ```tsx
         * <Group
         *   environments={{
         *     openURL:(url) => {
         *       return OpenURLActionResult.systemAction({
         *         url,
         *         prefersInApp: false
         *       })
         *     }
         *   }}
         * >
         * {urls.map(url =>
         *   <Link
         *     url={url}
         *   >{url}</Link>
         * )}
         * </Group>
         * ```
         */
        openURL?: (url: string) => OpenURLActionResult;
    };
};

/**
 * - `identify`: The identity transition specifying no changes.
 * - `materialize`: The materialize glass effect transition which will fade in content and animate in or out the glass material but will not attempt to match the geometry of any other glass effects.
 * - `matchedGeometry`: The matched geometry transition allows the geometries of glass shapes during an appearance or disappearance phase of a transition to be derived from the geometry of a nearby shape within the glass container.
 */
type GlassEffectTransition = 'identity' | 'materialize' | 'matchedGeometry';
/**
 * @available iOS 26.0+
 */
type GlassProps = {
    /**
     * Applies the Liquid Glass effect to a view.
     * @available iOS 26.0+
     */
    glassEffect?: boolean | UIGlass | Shape | {
        glass: UIGlass;
        shape: Shape;
    };
    /**
     * Associates a glass effect transition with any glass effects defined within this view.
     * @available iOS 26.0+
     */
    glassEffectTransition?: GlassEffectTransition;
    /**
     * Associates an identity value to Liquid Glass effects defined within this view.
     * @available iOS 26.0+
     */
    glassEffectID?: {
        id: string | number;
        namespace: NamespaceID;
    };
    /**
     * Associates any Liquid Glass effects defined within this view to a union with the provided identifier.
     * @available iOS 26.0+
     */
    glassEffectUnion?: {
        id: string | number;
        namespace: NamespaceID;
    };
};

type CommonViewProps = DialogProps & GesturesProps & FrameSizeProps & ForeAndBackgroundProps & PaddingAndBorderProps & ViewVisibilityProps & ImageViewProps & ViewStyleProps & TextFieldViewProps & TextViewProps & ShapeViewProps & ChartViewProps & ScrollProps & ToolbarsProps & SafeAreaProps & WidgetProps & ExtensionProps & ViewAppearProps & GridViewProps & ModalPresentationViewProps & TransformAndEffectProps & NavigationProps & ListViewProps & EditActionsProps & SymbolProps & TransitionProps & SearchableProps & ViewAnimationProps & LiveActivityProps & EnvironmentsProps & GlassProps & {
    disabled?: boolean;
    /**
     * A value that indicates the visibility of the non-transient system views overlaying the app.
     */
    preferredColorScheme?: ColorScheme;
    /**
     * Sets the unique tag value of this view.
     * Use this modifier to differentiate among certain selectable views, like the possible values of a `Picker`.
     * @example
     * ```tsx
     * function View() {
     *   const [value, setValue] = useState<number>()
     *
     *   return <Picker
     *      value={value}
     *      onChanged={newValue => setValue(newValue)}
     *   >
     *     <Text tag={0}>Item1</Text>
     *     <Text tag={1}>Item2</Text>
     *     <Text tag={2}>Item3</Text>
     *     <Text tag={3}>Item4</Text>
     *   </Picker>
     * }
     * ```
     */
    tag?: number | string;
    /**
     * Plays the specified feedback when the provided trigger value changes.
     */
    sensoryFeedback?: {
        /**
         * A value to monitor for changes to determine when to play.
         */
        trigger: number | string | boolean;
        /**
         * Which type of feedback to play.
         */
        feedback: SensoryFeedback;
    };
    /**
     * Sets the header prominence for this view.
     */
    headerProminence?: Prominence;
    /**
     * Adds a reason to apply a redaction to this view hierarchy.
     */
    redacted?: RedactedReason | null;
    /**
     * If true, removes any reason to apply a redaction to this view hierarchy.
     */
    unredacted?: boolean;
    /**
     * Sets the priority by which a parent layout should apportion space to this child.
     */
    layoutPriority?: number;
    /**
     * The modifiers to apply to the view. The modifiers are applied in the order they are specified.
     *
     * It is useful to apply a same modifier multiple times to a view.
     *
     * @example
     * ```tsx
     * function View() {
     *   return <VStack
     *     modifiers={
     *      modifiers()
     *        .padding()
     *        .background("red")
     *        .padding()
     *        .background("blue")
     *     }
     *   >
     *     <Text>Hello</Text>
     *   </VStack>
     * }
     * ```
     */
    modifiers?: ViewModifiers;
};

declare function modifiers(): ViewModifiers;
declare class ViewModifiers {
    readonly modifiers: {
        name: string;
        value: any;
    }[];
    frame(value: CommonViewProps["frame"]): this;
    containerRelativeFrame(value: CommonViewProps["containerRelativeFrame"]): this;
    foregroundStyle(value: CommonViewProps["foregroundStyle"]): this;
    background(value: CommonViewProps["background"]): this;
    padding(value?: CommonViewProps["padding"]): this;
    border(value: CommonViewProps["border"]): this;
    tint(value: CommonViewProps["tint"]): this;
    opacity(value: CommonViewProps["opacity"]): this;
    hidden(value?: CommonViewProps["hidden"]): this;
    labelsHidden(value?: CommonViewProps["labelsHidden"]): this;
    disabled(value?: CommonViewProps["disabled"]): this;
    preferredColorScheme(value: CommonViewProps["preferredColorScheme"]): this;
    scaleToFit(value?: CommonViewProps["scaleToFit"]): this;
    scaleToFill(value?: CommonViewProps["scaleToFill"]): this;
    aspectRatio(value: CommonViewProps["aspectRatio"]): this;
    imageScale(value: CommonViewProps["imageScale"]): this;
    controlSize(value: CommonViewProps["controlSize"]): this;
    buttonStyle(value: CommonViewProps["buttonStyle"]): this;
    buttonBorderShape(value: CommonViewProps["buttonBorderShape"]): this;
    labelStyle(value: CommonViewProps["labelStyle"]): this;
    toggleStyle(value: CommonViewProps["toggleStyle"]): this;
    pickerStyle(value: CommonViewProps["pickerStyle"]): this;
    formStyle(value: CommonViewProps["formStyle"]): this;
    datePickerStyle(value: CommonViewProps["datePickerStyle"]): this;
    gaugeStyle(value: CommonViewProps["gaugeStyle"]): this;
    listStyle(value: CommonViewProps["listStyle"]): this;
    progressViewStyle(value: CommonViewProps["progressViewStyle"]): this;
    autocorrectionDisabled(value?: CommonViewProps["autocorrectionDisabled"]): this;
    textInputAutocapitalization(value: CommonViewProps["textInputAutocapitalization"]): this;
    allowsHitTesting(value: CommonViewProps["allowsHitTesting"]): this;
    textFieldStyle(value: CommonViewProps["textFieldStyle"]): this;
    keyboardType(value: CommonViewProps["keyboardType"]): this;
    contentShape(value: CommonViewProps["contentShape"]): this;
    colorConvert(value?: CommonViewProps["colorConvert"]): this;
    clipShape(value: CommonViewProps["clipShape"]): this;
    clipped(value?: CommonViewProps["clipped"]): this;
    fixedSize(value: CommonViewProps["fixedSize"]): this;
    font(value: CommonViewProps["font"]): this;
    fontWidth(value: CommonViewProps["fontWidth"]): this;
    fontWeight(value: CommonViewProps["fontWeight"]): this;
    fontDesign(value: CommonViewProps["fontDesign"]): this;
    minScaleFactor(value: CommonViewProps["minScaleFactor"]): this;
    bold(value?: CommonViewProps["bold"]): this;
    baselineOffset(value: CommonViewProps["baselineOffset"]): this;
    kerning(value: CommonViewProps["kerning"]): this;
    italic(value?: CommonViewProps["italic"]): this;
    monospaced(value?: CommonViewProps["monospaced"]): this;
    monospacedDigit(value?: CommonViewProps["monospacedDigit"]): this;
    strikethrough(value: CommonViewProps["strikethrough"]): this;
    underline(value: CommonViewProps["underline"]): this;
    lineLimit(value: CommonViewProps["lineLimit"]): this;
    multilineTextAlignment(value: CommonViewProps["multilineTextAlignment"]): this;
    truncationMode(value: CommonViewProps["truncationMode"]): this;
    allowsTightening(value?: CommonViewProps["allowsTightening"]): this;
    flipsForRightToLeftLayoutDirection(value?: CommonViewProps["flipsForRightToLeftLayoutDirection"]): this;
    chartXAxis(value: CommonViewProps["chartXAxis"]): this;
    chartYAxis(value: CommonViewProps["chartYAxis"]): this;
    chartXAxisLabel(value: CommonViewProps["chartXAxisLabel"]): this;
    chartYAxisLabel(value: CommonViewProps["chartYAxisLabel"]): this;
    chartLegend(value: CommonViewProps["chartLegend"]): this;
    chartXScale(value: CommonViewProps["chartXScale"]): this;
    chartYScale(value: CommonViewProps["chartYScale"]): this;
    chartBackground(value: CommonViewProps["chartBackground"]): this;
    chartForegroundStyleScale(value: CommonViewProps["chartForegroundStyleScale"]): this;
    chartSymbolScale(value: CommonViewProps["chartSymbolScale"]): this;
    chartSymbolSizeScale(value: CommonViewProps["chartSymbolSizeScale"]): this;
    chartLineStyleScale(value: CommonViewProps["chartLineStyleScale"]): this;
    chartScrollableAxes(value: CommonViewProps["chartScrollableAxes"]): this;
    chartXSelection(value: CommonViewProps["chartXSelection"]): this;
    chartYSelection(value: CommonViewProps["chartYSelection"]): this;
    chartAngleSelection(value: CommonViewProps["chartAngleSelection"]): this;
    chartXVisibleDomain(value: CommonViewProps["chartXVisibleDomain"]): this;
    chartYVisibleDomain(value: CommonViewProps["chartYVisibleDomain"]): this;
    chartScrollPositionX(value: CommonViewProps["chartScrollPositionX"]): this;
    chartScrollPositionY(value: CommonViewProps["chartScrollPositionY"]): this;
    onSubmit(value: CommonViewProps["onSubmit"]): this;
    submitScope(value?: CommonViewProps["submitScope"]): this;
    submitLabel(value: CommonViewProps["submitLabel"]): this;
    onAppear(value: CommonViewProps["onAppear"]): this;
    onDisappear(value: CommonViewProps["onDisappear"]): this;
    onTapGesture(value: CommonViewProps["onTapGesture"]): this;
    onLongPressGesture(value: CommonViewProps["onLongPressGesture"]): this;
    onDragGesture(value: CommonViewProps["onDragGesture"]): this;
    onDropContent(value: CommonViewProps["onDropContent"]): this;
    tag(value: CommonViewProps["tag"]): this;
    refreshable(value: CommonViewProps["refreshable"]): this;
    scrollIndicator(value: CommonViewProps["scrollIndicator"]): this;
    scrollDisabled(value?: CommonViewProps["scrollDisabled"]): this;
    scrollClipDisabled(value?: CommonViewProps["scrollClipDisabled"]): this;
    scrollDismissesKeyboard(value: CommonViewProps["scrollDismissesKeyboard"]): this;
    defaultScrollAnchor(value: CommonViewProps["defaultScrollAnchor"]): this;
    scrollTargetlayout(value?: CommonViewProps["scrollTargetlayout"]): this;
    scrollTargetBehavior(value: CommonViewProps["scrollTargetBehavior"]): this;
    scrollContentBackground(value: CommonViewProps["scrollContentBackground"]): this;
    interactiveDismissDisabled(value?: CommonViewProps["interactiveDismissDisabled"]): this;
    safeAreaPadding(value: CommonViewProps["safeAreaPadding"]): this;
    safeAreaInset(value: CommonViewProps["safeAreaInset"]): this;
    ignoresSafeArea(value?: CommonViewProps["ignoresSafeArea"]): this;
    bottomBarVisibility(value: CommonViewProps["bottomBarVisibility"]): this;
    navigationBarVisibility(value: CommonViewProps["navigationBarVisibility"]): this;
    tabBarVisibility(value: CommonViewProps["tabBarVisibility"]): this;
    toolbar(value: CommonViewProps["toolbar"]): this;
    toolbarTitleMenu(value: CommonViewProps["toolbarTitleMenu"]): this;
    toolbarBackground(value: CommonViewProps["toolbarBackground"]): this;
    toolbarBackgroundVisibility(value: CommonViewProps["toolbarBackgroundVisibility"]): this;
    toolbarColorScheme(value: CommonViewProps["toolbarColorScheme"]): this;
    toolbarTitleDisplayMode(value: CommonViewProps["toolbarTitleDisplayMode"]): this;
    textSelection(value?: CommonViewProps["textSelection"]): this;
    textCase(value: CommonViewProps["textCase"]): this;
    widgetURL(value: CommonViewProps["widgetURL"]): this;
    widgetAccentable(value?: CommonViewProps["widgetAccentable"]): this;
    widgetBackground(value: CommonViewProps["widgetBackground"]): this;
    swingAnimation(value: CommonViewProps["swingAnimation"]): this;
    clockHandRotationEffect(value: CommonViewProps["clockHandRotationEffect"]): this;
    toast(options: CommonViewProps["toast"]): this;
    alert(options: CommonViewProps["alert"]): this;
    confirmationDialog(options: CommonViewProps["confirmationDialog"]): this;
    contextMenu(options: CommonViewProps["contextMenu"]): this;
    menuStyle(value: CommonViewProps["menuStyle"]): this;
    menuIndicator(value: CommonViewProps["menuIndicator"]): this;
    controlGroupStyle(value: CommonViewProps["controlGroupStyle"]): this;
    tabItem(value: CommonViewProps["tabItem"]): this;
    tabViewStyle(value: CommonViewProps["tabViewStyle"]): this;
    gridCellColumns(value: CommonViewProps["gridCellColumns"]): this;
    gridCellAnchor(value: CommonViewProps["gridCellAnchor"]): this;
    gridCellUnsizedAxes(value: CommonViewProps["gridCellUnsizedAxes"]): this;
    gridColumnAlignment(value: CommonViewProps["gridColumnAlignment"]): this;
    zIndex(value: CommonViewProps["zIndex"]): this;
    overlay(value: CommonViewProps["overlay"]): this;
    mask(value: CommonViewProps["mask"]): this;
    popover(value: CommonViewProps["popover"]): this;
    sheet(value: CommonViewProps["sheet"]): this;
    fullScreenCover(value: CommonViewProps["fullScreenCover"]): this;
    position(value: CommonViewProps["position"]): this;
    offset(value: CommonViewProps["offset"]): this;
    rotationEffect(value: CommonViewProps["rotationEffect"]): this;
    scaleEffect(value: CommonViewProps["scaleEffect"]): this;
    shadow(value: CommonViewProps["shadow"]): this;
    blur(value: CommonViewProps["blur"]): this;
    searchable(value: CommonViewProps["searchable"]): this;
    searchSuggestions(value: CommonViewProps["searchSuggestions"]): this;
    searchSuggestionsVisibility(value: CommonViewProps["searchSuggestionsVisibility"]): this;
    searchCompletion(value: CommonViewProps["searchCompletion"]): this;
    sensoryFeedback(value: CommonViewProps["sensoryFeedback"]): this;
    moveDisabled(value?: CommonViewProps["moveDisabled"]): this;
    deleteDisabled(value?: CommonViewProps["deleteDisabled"]): this;
    selectionDisabled(value?: CommonViewProps["selectionDisabled"]): this;
    leadingSwipeActions(value: CommonViewProps["leadingSwipeActions"]): this;
    trailingSwipeActions(value: CommonViewProps["trailingSwipeActions"]): this;
    symbolRenderingMode(value: CommonViewProps["symbolRenderingMode"]): this;
    symbolVariant(value: CommonViewProps["symbolVariant"]): this;
    symbolEffect(value: CommonViewProps["symbolEffect"]): this;
    presentationCompactAdaptation(value: CommonViewProps["presentationCompactAdaptation"]): this;
    presentationDragIndicator(value: CommonViewProps["presentationDragIndicator"]): this;
    presentationDetents(value: CommonViewProps["presentationDetents"]): this;
    presentationBackgroundInteraction(value: CommonViewProps["presentationBackgroundInteraction"]): this;
    presentationContentInteraction(value: CommonViewProps["presentationContentInteraction"]): this;
    presentationCornerRadius(value: CommonViewProps["presentationCornerRadius"]): this;
    navigationContainerBackground(value: CommonViewProps["navigationContainerBackground"]): this;
    navigationSplitViewContainerBackground(value: CommonViewProps["navigationSplitViewContainerBackground"]): this;
    listItemTint(value: CommonViewProps["listItemTint"]): this;
    listRowInsets(value: CommonViewProps["listRowInsets"]): this;
    listRowSpacing(value: CommonViewProps["listRowSpacing"]): this;
    listRowSeparator(value: CommonViewProps["listRowSeparator"]): this;
    listRowSeparatorTint(value: CommonViewProps["listRowSeparatorTint"]): this;
    listSectionSpacing(value: CommonViewProps["listSectionSpacing"]): this;
    listSectionSeparator(value: CommonViewProps["listSectionSeparator"]): this;
    listSectionSeparatorTint(value: CommonViewProps["listSectionSeparatorTint"]): this;
    listRowBackground(value: CommonViewProps["listRowBackground"]): this;
    contentMargins(value: CommonViewProps["contentMargins"]): this;
    contentTransition(value: CommonViewProps["contentTransition"]): this;
    badge(value: CommonViewProps["badge"]): this;
    badgeProminence(value: CommonViewProps["badgeProminence"]): this;
    headerProminence(value: CommonViewProps["headerProminence"]): this;
    navigationSplitViewColumnWidth(value: CommonViewProps["navigationSplitViewColumnWidth"]): this;
    navigationSplitViewStyle(value: CommonViewProps["navigationSplitViewStyle"]): this;
    navigationDestination(value: CommonViewProps["navigationDestination"]): this;
    navigationTitle(value: CommonViewProps["navigationTitle"]): this;
    navigationSubtitle(value: CommonViewProps["navigationSubtitle"]): this;
    navigationBarTitleDisplayMode(value: CommonViewProps["navigationBarTitleDisplayMode"]): this;
    navigationBarBackButtonHidden(value?: CommonViewProps["navigationBarBackButtonHidden"]): this;
    navigationTransition(value: CommonViewProps["navigationTransition"]): this;
    redacted(value: CommonViewProps["redacted"]): this;
    unredacted(value?: CommonViewProps["unredacted"]): this;
    translationHost(value: CommonViewProps["translationHost"]): this;
    layoutPriority(value: CommonViewProps["layoutPriority"]): this;
    gesture(value: CommonViewProps["gesture"]): this;
    simultaneousGesture(value: CommonViewProps["simultaneousGesture"]): this;
    highPriorityGesture(value: CommonViewProps["highPriorityGesture"]): this;
    defersSystemGestures(value: CommonViewProps["defersSystemGestures"]): this;
    animation(value: CommonViewProps["animation"]): this;
    transition(value: CommonViewProps["transition"]): this;
    matchedTransitionSource(value: CommonViewProps["matchedTransitionSource"]): this;
    matchedGeometryEffect(value: CommonViewProps["matchedGeometryEffect"]): this;
    activityBackgroundTint(value: CommonViewProps['activityBackgroundTint']): this;
    activitySystemActionForegroundColor(value: CommonViewProps['activitySystemActionForegroundColor']): this;
    environments(value: CommonViewProps["environments"]): this;
    toolbarRemoving(value: CommonViewProps["toolbarRemoving"]): this;
    toolbarRole(value: CommonViewProps["toolbarRole"]): this;
    tabBarMinimizeBehavior(value: CommonViewProps["tabBarMinimizeBehavior"]): this;
    tabViewBottomAccessory(value: CommonViewProps["tabViewBottomAccessory"]): this;
    tabViewSearchActivation(value: CommonViewProps["tabViewSearchActivation"]): this;
    tabViewCustomization(value: CommonViewProps["tabViewCustomization"]): this;
    tabViewSidebarHeader(value: CommonViewProps["tabViewSidebarHeader"]): this;
    tabViewSidebarFooter(value: CommonViewProps["tabViewSidebarFooter"]): this;
    tabViewSidebarBottomBar(value: CommonViewProps["tabViewSidebarBottomBar"]): this;
    indexViewStyle(value: CommonViewProps["indexViewStyle"]): this;
    labelReservedIconWidth(value: CommonViewProps["labelReservedIconWidth"]): this;
    labelIconToTitleSpacing(value: CommonViewProps["labelIconToTitleSpacing"]): this;
    containerShape(value: CommonViewProps["containerShape"]): this;
    searchToolbarBehavior(value: CommonViewProps["searchToolbarBehavior"]): this;
    listSectionIndexVisibility(value: CommonViewProps["listSectionIndexVisibility"]): this;
    listSectionMargins(value: CommonViewProps["listSectionMargins"]): this;
    sectionIndexLabel(value: CommonViewProps["sectionIndexLabel"]): this;
    sectionActions(value: CommonViewProps["sectionActions"]): this;
    scrollEdgeEffectStyle(value: CommonViewProps["scrollEdgeEffectStyle"]): this;
    scrollEdgeEffectHidden(value?: CommonViewProps["scrollEdgeEffectHidden"]): this;
    safeAreaBar(value: CommonViewProps["safeAreaBar"]): this;
    backgroundExtensionEffect(value?: CommonViewProps["backgroundExtensionEffect"]): this;
    glassEffect(value?: CommonViewProps["glassEffect"]): this;
    glassEffectTransition(value: CommonViewProps["glassEffectTransition"]): this;
    glassEffectID(value: CommonViewProps["glassEffectID"]): this;
    glassEffectUnion(value: CommonViewProps["glassEffectUnion"]): this;
}

type EnvironmentValues = {
    colorScheme: ColorScheme;
    colorSchemeContrast: ColorSchemeContrast;
    displayScale: number;
    horizontalSizeClass: UserInterfaceSizeClass | null;
    verticalSizeClass: UserInterfaceSizeClass | null;
    dismiss: () => void;
    dismissSearch: () => void;
    editMode: EditMode | null;
    widgetRenderingMode: WidgetRenderingMode;
    showsWidgetContainerBackground: boolean;
    isSearching: boolean;
    isPresented: boolean;
    /**
     * The placement of the bottom accessory view in tab view.
     * @available iOS 26.0+
     */
    tabViewBottomAccessoryPlacement: 'expanded' | 'inline';
};
type EnvironmentValuesReaderProps = {
    /**
     * The keys to read from the environment values.
     */
    keys: Array<keyof EnvironmentValues>;
    /**
     * The callback function to render the children, it will be called with the environment values.
     * @param values The environment values
     * @returns The rendered children
     */
    children: (values: EnvironmentValues) => VirtualNode;
};
/**
 * Reads environment values of the current view hierarchy.
 */
declare const EnvironmentValuesReader: FunctionComponent<EnvironmentValuesReaderProps>;

type FormProps = {
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * A container for grouping controls used for data entry, such as in settings or inspectors.
 *
 */
declare const Form: FunctionComponent<FormProps>;

/**
 * @deprecated
 * Use `data: Observable` and `builder` instead
 */
type ForEachDeprecatedProps = {
    count: number;
    itemBuilder: (index: number) => VirtualNode;
    /**
     * Sets the deletion action for the dynamic view. You must delete the corresponding item within action, as it will be called after the row has already been removed from the List.
     * @param indices A set of indices.
     */
    onDelete?: (indices: number[]) => void;
    /**
     * Invokes when elements in the dynamic view are moved. The closure takes two arguments that represent the offset relative to the dynamic view’s underlying collection of data. Pass null to disable the ability to move items.
     */
    onMove?: (indices: number[], newOffset: number) => void;
};
type ForEachProps<T extends {
    id: string;
}> = ForEachDeprecatedProps | {
    /**
     * An observable array of items, each item must have an `id` property.
     */
    data: Observable<T[]>;
    /**
     * The item builder for the ForEach component.
     */
    builder: (item: T, index: number) => VirtualNode;
    /**
     * Sets the edit action for the ForEach component. Defaults to null, no edit action.
     */
    editActions?: "delete" | "move" | "all" | null;
};
interface ForEachComponent {
    <T extends {
        id: string;
    }>(props: ForEachProps<T>): VirtualNode;
}
/**
 * Adding the `onDelete` to a `ForEach` inside a `List` will enable system-standard swipe-to-delete interactivity.
 *
 * @example
 * ```tsx
 * function View() {
 *   const fruits = useObservable(() => [
 *     'Apple',
 *     'Bananer',
 *     'Papaya',
 *     'Mango'
 *    ].map((name, index) => ({
 *      id: index.toString(),
 *      name
 *    }))
 *   )
 *
 *   return <NavigationStack>
 *     <List
 *       navigationTitle="Fruits"
 *       toolbar={{
 *         topBarTrailing: <EditButton />
 *       }}
 *     >
 *       <ForEach
 *         data={fruits}
 *         builder={(item, index) =>
 *           <Text
 *             key={item.id} // Must provide a unique key!!!
 *           >{item.name}</Text>
 *         }
 *       />
 *     </List>
 *   </NavigationStack>
 * }
 * ```
 */
declare const ForEach: ForEachComponent;

type FlowLayoutProps = {
    /**
     * The spacing between each item. Defaults to 8.
     */
    spacing?: number;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
declare const FlowLayout: FunctionComponent<FlowLayoutProps>;

interface GeometryProxy {
    readonly size: Size;
    readonly safeAreaInsets: {
        leading: number;
        top: number;
        trailing: number;
        bottom: number;
    };
    /**
     * Requires iOS 26.0+.
     */
    readonly containerCornerInsets: {
        bottomLeading: Size;
        bottomTrailing: Size;
        topLeading: Size;
        topTrailing: Size;
    } | null;
}
type GeometryReaderProps = {
    children: (proxy: GeometryProxy) => VirtualNode;
};
declare const GeometryReader: FunctionComponent<GeometryReaderProps>;

type GaugeProps = {
    /**
     * The value to show in the gauge.
     */
    value: number;
    /**
     * A view that describes the purpose of the gauge.
     */
    label: VirtualNode;
    /**
     * The min valid value. Defaults to 0.
     */
    min?: number;
    /**
     * The max valid value. Defaults to 1.
     */
    max?: number;
    /**
     * A view that describes the current value of the gauge.
     */
    currentValueLabel?: VirtualNode;
    /**
     * A view that describes the lower bounds of the gauge.
     */
    minValueLabel?: VirtualNode;
    /**
     * A view that describes the upper bounds of the gauge.
     */
    maxValueLabel?: VirtualNode;
};
/**
 * A gauge is a view that shows a current level of a value in relation to a specified finite capacity, very much like a fuel gauge in an automobile. Gauge displays are configurable; they can show any combination of the gauge’s current value, the range the gauge can display, and a label describing the purpose of the gauge itself.
 *
 */
declare const Gauge: FunctionComponent<GaugeProps>;

type GlassEffectContainerProps = {
    spacing?: number;
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * A view that combines multiple Liquid Glass shapes into a single shape that can morph individual shapes into one another.
 * @available iOS 26.0+
 */
declare const GlassEffectContainer: FunctionComponent<GlassEffectContainerProps>;

type GridProps = {
    /**
     * The guide for aligning the child views within the space allocated for a given cell. The default is `center`.
     */
    alignment?: Alignment;
    /**
     * The horizontal distance between each cell, given in points. The value is null by default, which results in a default distance between cells that’s appropriate for the platform.
     */
    horizontalSpacing?: number;
    /**
     * The vertical distance between each cell, given in points. The value is null by default, which results in a default distance between cells that’s appropriate for the platform.
     */
    verticalSpacing?: number;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A container view that arranges other views in a two dimensional layout.
 *
 * @example
 * ```tsx
 * <Grid>
 *   <GridRow>
 *     <Text>Hello</Text>
 *     <Image systemName="globe" />
 *   </GridRow>
 *   <Divider />
 *   <GridRow>
 *     <Image systemName="hand.wave" />
 *     <Text>World</Text>
 *   </GridRow>
 * <Grid>
 * ```
 * ![Example](https://docs-assets.developer.apple.com/published/f20954fd2b30390306220984d444d0cf/Grid-2-iOS@2x.png)
 */
declare const Grid: FunctionComponent<GridProps>;

type GridRowProps = {
    alignment?: VerticalAlignment;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A horizontal row in a two dimensional grid container.
 *
 */
declare const GridRow: FunctionComponent<GridRowProps>;

type GroupProps = {
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * Use a group to collect multiple views into a single instance, without affecting the layout of those views, like an `HStack`, `VStack`, or `Section` would. After creating a group, any modifier you apply to the group affects all of that group’s members.
 *
 * For example, the following code applies the `headline` font to three views in a group.
 * @example
 * ```tsx
 * function View() {
 *   <Group
 *     font="headline"
 *   >
 *     <Text>Hello</Text>
 *     <Text>Scripting</Text>
 *   </Group>
 * }
 * ```
 *
 */
declare const Group: FunctionComponent<GroupProps>;

type GroupBoxProps = {
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
} & ({
    title: string;
} | {
    label: VirtualNode;
});
/**
 * Use a group box when you want to visually distinguish a portion of your user interface with an optional title for the boxed content.
 *
 * The following example sets up a GroupBox with the label “End-User Agreement”, and a long agreementText string in a Text view wrapped by a ScrollView. The box also contains a `Toggle` for the user to interact with after reading the text.
 * @example
 * ```tsx
 * <GroupBox
 *   label={
 *     <Label
 *       title="End-User Agreement"
 *       systemName="building.columns"
 *     />
 *   }
 * >
 *   <ScrollView
 *     alignment="vertical"
 *     showIndicators
 *     height={100}
 *   >
 *     <Text
 *       font="fontnote"
 *     >{argreementText}</Text>
 *   </ScrollView>
 *   <Toggle
 *     value={agree}
 *     onChange={setAgree}
 *   >
 *     <Text>I agree to the above terms</Text>
 *   </Toggle>
 * </GroupBox>
 * ```
 *
 */
declare const GroupBox: FunctionComponent<GroupBoxProps>;

type HStackProps = {
    /**
     * The guide for aligning the subviews in this stack.
     * This guide has the same vertical screen coordinate for every subview.
     * Default is `center`
     */
    alignment?: VerticalAlignment;
    /**
     * The distance between adjacent subviews, or `undefined` if you want the stack to
     * choose a default distance for each pair of subviews.
     */
    spacing?: number;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * A view that arranges its subviews in a vertical line.
 *
 *
 * @example
 * ```tsx
 * function View() {
 *   return (
 *    <HStack
 *      alignment="top"
 *      spacing={10}
 *    >
 *      <Text>
 *        Item1
 *      </Text>
 *      <Text>
 *        Item2
 *      </Text>
 *    </HStack>
 *   )
 * }
 * ```
 */
declare const HStack: FunctionComponent<HStackProps>;

/**
 * Constants that indicate the rendering mode for an Image in when displayed in a widget in [accented](https://developer.apple.com/documentation/widgetkit/widgetrenderingmode/accented) mode.
 *  - `accented`: Specifies that the Image should be included as part of the accented widget group.
 *  - `accentedDesaturated`: Maps the luminance of the Image in to the alpha channel, replacing color channels with the color applied to the accent group.
 *  - `desaturated`: Maps the luminance of the Image in to the alpha channel, replacing color channels with the color applied to the default group.
 *  - `fullColor`: SSpecifies that the Image should be rendered at full color with no other color modifications. Only applies to iOS.
 */
type WidgetAccentedRenderingMode = 'accented' | 'desaturated' | 'accentedDesaturated' | 'fullColor';
/**
 *  This type is used to define how an image is rendered.
 *  - `original`: The image is rendered as it was provided, with its original colors.
 *  - `template`: The image is rendered as a template image, which means that its color information is ignored and it is rendered using a single color (usually the tint color).
 */
type ImageRenderingMode = 'original' | 'template';
/**
 * This type is used to define the interpolation quality to use when scaling an image.
 *  - `none`: The image is scaled with no interpolation. This can result in a pixelated appearance.
 *  - `low`: The image is scaled with low-quality interpolation. This can result in a blocky appearance.
 *  - `medium`: The image is scaled with medium-quality interpolation. This provides a balance between quality and performance.
 *  - `high`: The image is scaled with high-quality interpolation. This provides the best quality, but may be slower.
 */
type ImageInterpolation = 'none' | 'low' | 'medium' | 'high';
type ImageRenderingBehaviorProps = {
    /**
     * Specifies the how to render an Image when using the accented mode in Widget.
     */
    widgetAccentedRenderingMode?: WidgetAccentedRenderingMode;
    /**
     * Sets the mode by which view resizes an image to fit its space.
     */
    resizable?: ImageResizable;
    /**
     * The rendering mode to use for the image. The default is `original`.
     * You can use `template` rendering mode to apply a tint color to the image.
     */
    renderingMode?: ImageRenderingMode;
    /**
     * The interpolation quality to use when scaling an image.
     * The default is `medium`.
     */
    interpolation?: ImageInterpolation;
    /**
     *  A Boolean value that indicates whether the image should be rendered with antialiased edges. The default is `false`.
     */
    antialiased?: boolean;
};
/**
 * This type is used to define how an image is resized to fit its space.
 *  - `true`: The image is resized to fit its space using the default resizing mode.
 *  - `false`: The image is not resized to fit its space.
 *  - `capInsets`: The cap insets define portions of the image that are not resized. The areas between the cap insets are stretched or tiled to fill the remaining space.
 *  - `resizingMode`: The resizing mode to use for the image. The default is `stretch`.
 */
type ImageResizable = boolean | {
    capInsets?: EdgeInsets;
    resizingMode?: ImageResizingMode;
};
/**
 * This type is used to define an object that dynamically applies an image source to an Image view based on a color scheme.
 *  - `dark`: The image source for the dark color scheme mode.
 *  - `light`: The image source for the light color scheme mode.
 */
type DynamicImageSource<T> = {
    dark: T;
    light: T;
};
type SystemImageProps = {
    /**
     * Creates an image using a system-provided symbol.
     * Use [SF Symbols](https://developer.apple.com/design/resources/#sf-symbols) to find symbols and their corresponding names.
     * You can also browse symbol names in the [SF Symbols Browser](https://apps.apple.com/cn/app/sf-symbols-reference/id1491161336?l=en-GB) app for iOS.
     */
    systemName: string;
    /**
     * An optional value between 0.0 and 1.0 that the rendered image can use to customize its appearance, if specified. If the symbol doesn’t support variable values, this parameter has no effect. Use the SF Symbols app to look up which symbols support variable values.
     */
    variableValue?: number;
    filePath?: never;
    imageUrl?: never;
    image?: never;
};
type NetworkImageProps = {
    /**
     * Creates an image using a network image url.
     */
    imageUrl: string | DynamicImageSource<string>;
    /**
     * The view to show until the load operation completes successfully.
     */
    placeholder?: VirtualNode;
    filePath?: never;
    image?: never;
    systemName?: never;
};
type FileImageProps = {
    /**
     * Creates an image using a local file path.
     */
    filePath: string | DynamicImageSource<string>;
    imageUrl?: never;
    image?: never;
    systemName?: never;
};
type UIImageProps = {
    image: UIImage | DynamicImageSource<UIImage>;
    imageUrl?: never;
    filePath?: never;
    systemName?: never;
};
type ImageProps = (SystemImageProps | NetworkImageProps | FileImageProps | UIImageProps) & ImageRenderingBehaviorProps;
/**
 * A view that displays an image.
 * You can create images from many sources:
 *
 *  - `filePath` display an image using local image file path.
 *  - `systemName` display an image using a system-provided symbol.
 *  - `imageUrl` display an image using a network image link.
 *  - `image` display an iage using a `UIImage` object.
 *
 *
 * @example
 * ```tsx
 * <Image
 *   systemName="globe"
 *   width={20}
 *   height={20}
 * />
 * ```
 */
declare const Image: FunctionComponent<ImageProps>;

type LabelProps = {
    title: string;
    /**
     * A system icon image name.
     */
    systemImage: string;
};
/**
 * Create a label with a system icon image and a title.
 *
 */
declare const Label: FunctionComponent<LabelProps>;

type LazyHGridProps = {
    /**
     * An array of grid items that size and position each column of the grid.
     */
    rows: GridItem[];
    /**
     * The alignment of the grid within its parent view.
     */
    alignment?: VerticalAlignment;
    /**
     * The spacing between the grid and the next item in its parent view.
     */
    spacing?: number;
    /**
     * Views to pin to the bounds of a parent scroll view.
     */
    pinnedViews?: PinnedScrollViews;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A container view that arranges its child views in a grid that grows horizontally, creating items only as needed.
 *
 */
declare const LazyHGrid: FunctionComponent<LazyHGridProps>;

type LazyHStackProps = {
    /**
     * The guide for aligning the subviews in this stack. All child views have the same vertical screen coordinate.
     */
    alignment?: VerticalAlignment;
    /**
     * The distance between adjacent subviews, or null if you want the stack to choose a default distance for each pair of subviews.
     */
    spacing?: number;
    /**
     * The kinds of child views that will be pinned.
     */
    pinnedViews?: PinnedScrollViews;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A view that arranges its children in a line that grows horizontally, creating items only as needed.
 *
 */
declare const LazyHStack: FunctionComponent<LazyHStackProps>;

type LazyVGridProps = {
    /**
     * An array of grid items to size and position each row of the grid.
     */
    columns: GridItem[];
    /**
     * The guide for aligning the subviews in this stack. All child views have the same vertical screen coordinate.
     */
    alignment?: HorizontalAlignment;
    /**
     * The distance between adjacent subviews, or null if you want the stack to choose a default distance for each pair of subviews.
     */
    spacing?: number;
    /**
     * The kinds of child views that will be pinned.
     */
    pinnedViews?: PinnedScrollViews;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A container view that arranges its child views in a grid that grows horizontally, creating items only as needed.
 *
 */
declare const LazyVGrid: FunctionComponent<LazyVGridProps>;

type LazyVStackProps = {
    /**
     * The guide for aligning the subviews in this stack. All child views have the same horizontal screen coordinate.
     */
    alignment?: HorizontalAlignment;
    /**
     * The distance between adjacent subviews, or null if you want the stack to choose a default distance for each pair of subviews.
     */
    spacing?: number;
    /**
     * The kinds of child views that will be pinned.
     */
    pinnedViews?: PinnedScrollViews;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A view that arranges its children in a line that grows vertically, creating items only as needed.
 *
 */
declare const LazyVStack: FunctionComponent<LazyVStackProps>;

type LinkProps = {
    url: string;
    children: string | VirtualNode;
};
/**
 * A control for navigating to a URL.
 *
 * The `widgetURL` will be ignored.
 *
 *
 * @example
 * ```tsx
 * <Link
 *   url={Script.createOpenURLScheme('Script A')}
 * >Open Script A</Link>
 *
 * <Link
 *   url='https://example.com'
 * >
 *   <HStack>
 *     <Image
 *       systemName='globe'
 *       width={20}
 *       height={20}
 *       padding={{
 *         trailing: 8,
 *       }}
 *     />
 *     <Text>Open Link</Text>
 *   </HStack>
 * </Link>
 * ```
 */
declare const Link: FunctionComponent<LinkProps>;

type ListProps = {
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A container that presents rows of data arranged in a single column, optionally providing the ability to select one or more members.
 * @example
 * ```tsx
 * function View() {
 *   const names = ["Elon", "Larry", "Jobs"]
 *
 *   return (
 *     <List>
 *       {names.map(name =>(
 *          <Text>{name}</Text>
 *       )}
 *     </List>
 *   )
 * }
 * ```
 *
 */
declare const List: FunctionComponent<ListProps>;

type MarkdownProps = {
    /**
     * Markdown text content.
     */
    content: string;
    /**
     * Specify the theme of the markdown view.
     */
    theme?: 'basic' | 'github' | 'docC';
    /**
     * Specify the theme for the highlighter. No theme is used by default.
     */
    highlighterTheme?: 'midnight' | 'presentation' | 'sundellsColors' | 'sunset' | 'wwdc17' | 'wwdc18';
    /**
     * Use the default highlighter theme, the system will switch to the corresponding theme according to the current colorScheme. If you set the `highlighterTheme`, this configuration will not take effect.
     */
    useDefaultHighlighterTheme?: boolean;
    /**
     * Whether the markdown view is scrollable, defaults to `true`.
     */
    scrollable?: boolean;
};
/**
 * Display a view by markdown text.
 */
declare const Markdown: FunctionComponent<MarkdownProps>;

type MenuProps = {
    /**
     * The action to perform on primary interaction with the menu.
     */
    primaryAction?: () => void;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
} & ({
    /**
     * The title describes the contents of the menu.
     */
    title: string;
    /**
     * The name of the image resource to lookup.
     */
    systemImage?: string;
    label?: never;
} | {
    /**
     * A view describing the content of the menu.
     */
    label: VirtualNode;
    title?: never;
    systemImage?: never;
});
/**
 * A control for presenting a menu of actions.
 *
 * @example
 * ```tsx
 * <Menu title="Actions">
 *   <Button title="Rename" action={rename} />
 *   <Button title="Delete" action={delete} />
 *   <Menu title="Copy">
 *     <Button title="Copy" action={copy} />
 *     <Button title="Copy Formated" action={copyFormated} />
 *   </Menu>
 * </Menu>
 * ```
 */
declare const Menu: FunctionComponent<MenuProps>;

type MultiColumnsPickerProps = {
    /**
     * The options set of all components.
     */
    options: string[][];
} & ({
    /**
     * The selected index set of all components.
     */
    selections: number[];
    /**
     * The callback function for when selections changed.
     */
    onSelectionsChanged: (newSelection: number[]) => void;
} | {
    selections: Observable<number[]>;
    onSelectionsChanged?: never;
});
/**
 * Multiple columns picker view.
 * This component allows you to select multiple items from a set of options, where each column represents a different set of options.
 */
declare const MultiColumnsPicker: FunctionComponent<MultiColumnsPickerProps>;
/**
 * @deprecated
 * Use `MultiColumnsPicker` instead
 */
declare const MultiPicker: FunctionComponent<MultiColumnsPickerProps>;

type NamespaceReaderProps = {
    children: (namespace: NamespaceID) => VirtualNode;
};
declare const NamespaceReader: FunctionComponent<NamespaceReaderProps>;

type NavigationLinkProps = {
    /**
     * A view for the navigation link to present.
     */
    destination: VirtualNode;
} & ({
    title: string;
} | {
    /**
     * A label describing the destination to present.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
});
/**
 * A view that controls a navigation presentation.
 */
declare const NavigationLink: FunctionComponent<NavigationLinkProps>;

/**
 * The visibility of the leading columns in a navigation split view.
 *  - `automatic`: Use the default leading column visibility for the current device.
 *  - `all`: Show all the columns of a three-column navigation split view.
 *  - `doubleColumn`: Show the content column and detail area of a three-column navigation split view, or the sidebar column and detail area of a two-column navigation split view.
 *  - `detailOnly`: Hide the leading two columns of a three-column navigation split view, so that just the detail area shows.
 */
type NavigationSplitViewVisibility = "automatic" | "all" | "doubleColumn" | "detailOnly";
/**
 * A view that represents a column in a navigation split view.
 */
type NavigationSplitViewColumn = "sidebar" | "content" | "detail";
type NavigationSplitViewProps = {
    /**
     * A value that controls the visibility of the leading columns.
     */
    columnVisibility?: {
        value: NavigationSplitViewVisibility;
        onChanged: (value: NavigationSplitViewVisibility) => void;
    } | Observable<NavigationSplitViewVisibility>;
    /**
     * A value that controls which column appears on top when the view collapses.
     * A NavigationSplitView collapses into a single stack in some contexts, like on iPhone or Apple Watch. Use this type with the preferredCompactColumn parameter to control which column of the navigation split view appears on top of the collapsed stack.
     */
    preferredCompactColumn?: {
        value: NavigationSplitViewColumn;
        onChanged: (value: NavigationSplitViewColumn) => void;
    } | Observable<NavigationSplitViewColumn>;
    /**
     * The view to show in the leading column.
     */
    sidebar: VirtualNode;
    /**
     * The view to show in the middle column.
     */
    content?: VirtualNode;
    /**
     * The view to show in the detail area.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
};
/**
 * A view that presents views in two or three columns, where selections in leading columns control presentations in subsequent columns.
 *
 */
declare const NavigationSplitView: FunctionComponent<NavigationSplitViewProps>;

type NavigationStackProps = {
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
};
/**
 * A view that displays a root view and enables you to present additional views over the root view.
 *
 * @example
 * ```tsx
 *
 * function View() {
 *   return <NavigationStack>
 *     <List>
 *       <NavigationLink
 *         title="Page1"
 *         destination={
 *           <Text>Page1 content</Text>
 *         }
 *       />
 *       <NavigationLink
 *         title="Page2"
 *         destination={
 *           <Text>Page2 content</Text>
 *         }
 *       />
 *     </List>
 *   </NavigationStack>
 * }
 * ```
 */
declare const NavigationStack: FunctionComponent<NavigationStackProps>;

/**
 * Picker value types.
 */
type PickerValue = number | string;
type PickerProps<T extends PickerValue> = {
    /**
     * The views of options.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & ({
    /**
     * A string that describes the purpose of selecting an option.
     */
    title: string;
    /**
     * The name of the image resource to lookup.
     */
    systemImage?: string;
} | {
    /**
     * A view that describes the purpose of selecting an option.
     */
    label: VirtualNode;
}) & ({
    value: T;
    onChanged: (value: T) => void;
} | {
    value: Observable<T>;
    onChanged?: never;
});
/**
 * A control for selecting from a set of mutually exclusive values.
 *
 */
declare const Picker: FunctionComponent<PickerProps<number> | PickerProps<string>>;

type TimerIntervalProgressViewProps = {
    /**
     * If true (the default), the view empties as time passes.
     */
    countsDown?: boolean;
    /**
     * A view that describes the task in progress.
     */
    label?: VirtualNode;
    /**
     * A view that describes the level of completed progress of the task.
     */
    currentValueLabel?: VirtualNode;
} & ({
    /**
     * The date range `from` timestamp over which the view progresses.
     * @deprecated
     * Use `timerFrom: Date` instead
     */
    timerFrom: number;
    /**
     * The date range `to` timestamp over which the view progresses.
     * @deprecated
     * Use `timerTo: Date` instead
     */
    timerTo: number;
} | {
    timerFrom: Date;
    timerTo: Date;
});
type NormalProgressViewProps = {
    /**
     * The completed amount of the task to this point, in a range of 0.0 to total, or nil if the progress is indeterminate.
     */
    value?: number;
    /**
     * The full amount representing the complete scope of the task, meaning the task is complete if value equals total. The default value is 1.0.
     */
    total?: number;
    /**
     * The title that describes the task in progress
     */
    title?: string;
    /**
     * A view that describes the task in progress.
     */
    label?: VirtualNode;
    /**
     * A view that describes the level of completed progress of the task.
     */
    currentValueLabel?: VirtualNode;
};
type ProgressViewProps = TimerIntervalProgressViewProps | NormalProgressViewProps;
/**
 * Use a progress view to show that a task is incomplete but advancing toward completion. A progress view can show both determinate (percentage complete) and indeterminate (progressing or not) types of progress.
 *
 * Create a determinate progress view by initializing a ProgressView with a binding to a numeric value that indicates the progress, and a total value that represents completion of the task. By default, the progress is 0.0 and the total is 1.0.
 *
 */
declare const ProgressView: FunctionComponent<ProgressViewProps>;

type QRImageProps = {
    /**
     * QR Code string data.
     */
    data: string;
    /**
     * Display size of the view.
     */
    size?: number;
};
/**
 * A view display the QR Code image by string data and size.
 *
 */
declare const QRImage: FunctionComponent<QRImageProps>;

type ScrollViewProps = {
    /**
     * The scroll view’s scrollable axis. The default axis is the vertical axis.
     */
    axes?: AxisSet;
    /**
     * The scroll view’s content.
     */
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * The scroll view displays its content within the scrollable content region. As the user performs platform-appropriate scroll gestures, the scroll view adjusts what portion of the underlying content is visible. ScrollView can scroll horizontally, vertically, or both, but does not provide zooming functionality.
 *
 * In the following example, a ScrollView allows the user to scroll through a VStack containing 100 Text views. The image after the listing shows the scroll view’s temporarily visible scrollbar at the right; you can disable it with the showsIndicators parameter of the ScrollView initializer.
 * @example
 * ```tsx
 * <ScrollView>
 *   <VStack>
 *     {new Array(100).fill('').map(index => (
 *        <Text>Row {index}</Text>
 *     ))}
 *   </VStack>
 * </ScrollView>
 * ```
 */
declare const ScrollView: FunctionComponent<ScrollViewProps>;

interface ScrollViewProxy {
    scrollTo: (id: string | number, anchor?: KeywordPoint | Point) => void;
}
type ScrollViewReaderProps = {
    children: (scrollViewProxy: ScrollViewProxy) => VirtualNode;
};
declare const ScrollViewReader: FunctionComponent<ScrollViewReaderProps>;

type SectionProps = {
    /**
     * The section’s content.
     */
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
} & ({
    /**
     * A view to use as the section’s header.
     */
    header?: VirtualNode;
    /**
     * A view to use as the section’s footer.
     */
    footer?: VirtualNode;
    title?: never;
} | {
    /**
     * The string describes the contents of the section.
     */
    title?: string;
    header?: never;
    footer?: never;
}) & ({
    /**
     * A boolean value that determines the section’s expansion state (expanded or collapsed).
     */
    isExpanded?: boolean;
    /**
     * The `isExpanded` value changed handler.
     */
    onChanged?: (value: boolean) => void;
} | {
    isExpanded?: Observable<boolean>;
    onChanged?: never;
});
/**
 * A container view that you can use to add hierarchy within certain views.
 *
 * Use Section instances in views like `List`, `Picker`, and `Form` to organize content into separate sections. Each section has custom content that you provide on a per-instance basis. You can also provide headers and footers for each section.
 *
 */
declare const Section: FunctionComponent<SectionProps>;

type SecureFieldProps = ({
    title: string;
    label?: never;
} | {
    title?: never;
    label: VirtualNode;
}) & {
    /**
     * The prompt provides guidance on what people should type into the text field.
     */
    prompt?: string;
    /**
     * Default to false.
     */
    autofocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
} & ({
    value: string;
    onChanged: (value: string) => void;
} | {
    value: Observable<string>;
    onChanged?: never;
});
declare const SecureField: FunctionComponent<SecureFieldProps>;

/**
 * A rectangular shape aligned inside the frame of the view containing it.
 *
 */
declare const Rectangle: FunctionComponent<ShapeProps>;
/**
 * A circle centered on the frame of the view containing it.
 *
 */
declare const Circle: FunctionComponent<ShapeProps>;
/**
 * An ellipse aligned inside the frame of the view containing it.
 *
 */
declare const Ellipse: FunctionComponent<ShapeProps>;
/**
 * A capsule shape aligned inside the frame of the view containing it.
 *
 */
declare const Capsule: FunctionComponent<ShapeProps>;
type RoundedRectangleProps = ShapeProps & ({
    /**
     * The radius of the rounded corners.
     */
    cornerRadius: number;
} | {
    /**
     * The width and height of the rounded corners.
     */
    cornerSize: {
        width: number;
        height: number;
    };
}) & {
    /**
     * The style of corners drawn by the shape. Default to continuous.
     */
    style?: RoundedCornerStyle;
};
/**
 * A rectangular shape aligned inside the frame of the view containing it.
 *
 */
declare const RoundedRectangle: FunctionComponent<RoundedRectangleProps>;
type UnevenRoundedRectangleProps = ShapeProps & {
    topLeadingRadius: number;
    bottomLeadingRadius: number;
    bottomTrailingRadius: number;
    topTrailingRadius: number;
    /**
     * The style of corners drawn by the shape. Default to continuous.
     */
    style?: RoundedCornerStyle;
};
/**
 * A rectangular shape with rounded corners with different values, aligned inside the frame of the view containing it.
 *
 */
declare const UnevenRoundedRectangle: FunctionComponent<UnevenRoundedRectangleProps>;
type ConcentricRectangleProps = ShapeProps & ConcentricRectangleShape;
/**
 * A concentric rectangle aligned inside the frame of the view containing it.
 * @available iOS 26+.
 */
declare const ConcentricRectangle: FunctionComponent<ConcentricRectangleProps>;

type SliderWithRangeValueLabelsProps = {
    /**
     * The minimum available value.
     */
    min: number;
    /**
     * The maximum available value.
     */
    max: number;
    /**
     * A callback for when editing begins and ends.
     */
    onEditingChanged?: (value: boolean) => void;
    /**
     * The distance between each valid value. Defaults to 1.
     */
    step?: number;
    /**
     * A View that describes the purpose of the instance. Not all slider styles show the label, but even in those cases, system uses the label for accessibility. For example, VoiceOver uses the label to identify the purpose of the slider.
     */
    label: VirtualNode;
    /**
     * A view that describes the `min` value.
     */
    minValueLabel: VirtualNode;
    /**
     * A view that describes the `max` value.
     */
    maxValueLabel: VirtualNode;
};
type SliderWithLabelProps = {
    /**
     * The minimum available value.
     */
    min: number;
    /**
     * The maximum available value.
     */
    max: number;
    /**
     * A callback for when editing begins and ends.
     */
    onEditingChanged?: (value: boolean) => void;
    /**
     * The distance between each valid value. Defaults to 1.
     */
    step?: number;
    /**
     * A View that describes the purpose of the instance. Not all slider styles show the label, but even in those cases, system uses the label for accessibility. For example, VoiceOver uses the label to identify the purpose of the slider.
     */
    label: VirtualNode;
    minValueLabel?: never;
    /**
     * A view that describes the `max` value.
     */
    maxValueLabel?: never;
};
type SliderWithTicksProps = {
    /**
     * The minimum available value.
     */
    min: number;
    /**
     * The maximum available value.
     */
    max: number;
    /**
     * A callback for when editing begins and ends.
     */
    onEditingChanged?: (value: boolean) => void;
    label: VirtualNode;
    /**
     * @available iOS 26.0+
     */
    ticks?: number[];
    /**
     * @available iOS 26.0+
     */
    currentValueLabel?: VirtualNode;
    step?: never;
    minValueLabel?: never;
    maxValueLabel?: never;
};
type SliderProps = (SliderWithRangeValueLabelsProps | SliderWithLabelProps | SliderWithTicksProps) & ({
    /**
     * The selected value within bounds.
     */
    value: number;
    /**
     * A callback for when the value changed.
     */
    onChanged: (value: number) => void;
} | {
    value: Observable<number>;
    onChanged?: never;
});
/**
 * A control for selecting a value from a bounded linear range of values.
 *
 */
declare const Slider: FunctionComponent<SliderProps>;

/**
 * A flexible space that expands along the major axis of its containing stack layout,
 * or on both axes if not contained in a stack.
 *
 *
 */
declare const Spacer: FunctionComponent<{
    minLength?: number;
}>;

type StepperProps = ({
    /**
     * A string describing the purpose of the stepper.
     */
    title: string;
    children?: never;
} | {
    /**
     * A view describing the purpose of this stepper.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
    title?: never;
}) & {
    /**
     * The function to execute when the user clicks or taps the control’s plus button.
     */
    onIncrement: () => void;
    /**
     * The function to execute when the user clicks or taps the control’s minus button.
     */
    onDecrement: () => void;
    /**
     * A function called when editing begins and ends. For example, on iOS, the user may touch and hold the increment or decrement buttons on a Stepper which causes the execution of the onEditingChanged closure at the start and end of the gesture.
     */
    onEditingChanged?: (value: boolean) => void;
};
/**
 * A control that performs increment and decrement actions.
 *
 */
declare const Stepper: FunctionComponent<StepperProps>;

/**
 * Props for SVG view when using URL as source.
 */
type SVGURLSourceProps = {
    url: string | DynamicImageSource<string>;
    filePath?: never;
    code?: never;
};
/**
 * Props for SVG view when using local file path as source.
 */
type SVGFilePathSourceProps = {
    url?: never;
    code?: never;
    filePath: string | DynamicImageSource<string>;
};
/**
 * Props for SVG view when using code as source.
 */
type SVGCodeSourceProps = {
    code: string | DynamicImageSource<string>;
    filePath?: never;
    url?: never;
};
type SVGProps = (SVGURLSourceProps | SVGFilePathSourceProps | SVGCodeSourceProps) & ImageRenderingBehaviorProps;
/**
 * A view that displays an SVG image.
 * You can create SVG images from three sources:
 *
 *  - `url` display an SVG image using a network image link.
 *  - `filePath` display an SVG image using local image file path.
 *  - `code` display an SVG image using inline SVG code.
 *
 * SVG images can be rendered as bitmap images. You can also choose to render the SVG as a template image that can be tinted.
 *
 * @example
 *
 * ```tsx
 * <SVG
 *   filePath="/path/to/local/image.svg"
 *   resizable
 *   frame={{ width: 50, height: 50 }}
 *   renderingMode="template"
 *   foregroundColor="red"
 * />
 * ```
 *
 * ```tsx
 * <SVG
 *   code=`<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">
 *   <circle cx="50" cy="50" r="40" stroke="green" stroke-width="4" fill="yellow" />
 * </svg>`
 *   frame={{ width: 100, height: 100 }}
 * />
 * ```
 */
declare const SVG: FunctionComponent<SVGProps>;

type TabRole = 'search';
type TabProps = {
    title: string;
    systemImage: string;
    value?: number | string;
    role?: TabRole;
    tabPlacement?: TabPlacement;
    sectionActions?: VirtualNode;
    defaultVisibility?: {
        placements: AdaptableTabBarPlacement[];
        visibility: Visibility;
    };
    customizationID?: string;
    customizationBehavior?: TabCustomizationBehavior;
    draggable?: string;
    dropDestination?: (items: string[]) => void;
    children: VirtualNode;
};
/**
 * A view that represents a tab in a tab view.
 * @available iOS 18.0+
 */
declare const Tab: FunctionComponent<TabProps>;

type TabViewProps<T extends string | number> = {
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & ({
    tabIndex?: number;
    onTabIndexChanged?: (value: number) => void;
    selection?: never;
} | {
    selection?: Observable<T>;
    tabIndex?: never;
    onTabIndexChanged?: never;
});
/**
 * A view that switches between multiple child views using interactive user interface elements.
 *
 * @example
 * ```tsx
 * function View() {
 *   const selection = useObservable<number>(0)
 *
 *   return <TabView
 *     selection={selection}
 *   >
 *     <TabContentView1
 *       tabItem={
 *         <Label
 *           title="Tab1"
 *           systemImage="tray.and.arrow.down.fill"
 *         />
 *       }
 *       tag={0}
 *     />
 *     <TabContentView2
 *       tabItem={
 *         <Label
 *           title="Tab2"
 *           systemImage="tray.and.arrow.up.fill"
 *         />
 *       }
 *       tag={1}
 *     />
 *   </TabView>
 * }
 * ```
 */
declare const TabView: FunctionComponent<({
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & {
    tabIndex?: number;
    onTabIndexChanged?: (value: number) => void;
    selection?: never;
}) | ({
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & {
    selection?: Observable<string> | undefined;
    tabIndex?: never;
    onTabIndexChanged?: never;
}) | ({
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
} & {
    selection?: Observable<number> | undefined;
    tabIndex?: never;
    onTabIndexChanged?: never;
})>;

type TabSectionProps = {
    tabPlacement?: TabPlacement;
    sectionActions?: VirtualNode;
    defaultVisibility?: {
        placements: AdaptableTabBarPlacement[];
        visibility: Visibility;
    };
    customizationID?: string;
    customizationBehavior?: TabCustomizationBehavior;
    draggable?: string;
    dropDestination?: (items: string[]) => void;
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
} & ({
    title?: string;
    header?: never;
} | {
    title?: never;
    header?: VirtualNode;
});
/**
 * Use TabSection to organize tab content into separate sections. Each section has custom tab content that you provide on a per-instance basis. You can also provide a header for each section.
 * @available iOS 18.0+
 */
declare const TabSection: FunctionComponent<TabSectionProps>;

type TextProps = {
    children: null | string | number | boolean | Array<string | number | boolean | undefined | null>;
} | {
    /**
     * Render as a markdown text.
     */
    attributedString: string;
} | {
    /**
     * Use to render as a rich text.
     */
    styledText: StyledText;
};
type UnderlineStyle = "byWord" | "double" | "patternDash" | "patternDashDot" | "patternDashDotDot" | "patternDot" | "single" | "thick";
type StyledText = Pick<CommonViewProps, "font" | "fontDesign" | "fontWeight" | "italic" | "bold" | "baselineOffset" | "kerning" | "monospaced" | "monospacedDigit"> & {
    underlineColor?: Color;
    underlineStyle?: UnderlineStyle;
    strokeColor?: Color;
    strokeWidth?: number;
    strikethroughColor?: Color;
    strikethroughStyle?: UnderlineStyle;
    foregroundColor?: Color;
    backgroundColor?: Color;
    content: string | (string | StyledText)[];
    link?: string;
    onTapGesture?: () => void;
};
/**
 * A view that displays one or more lines of read-only text.
 *
 * @example
 * ```tsx
 * <Text font="title">
 *   Hello world!
 * </Text>
 * ```
 */
declare const Text: FunctionComponent<TextProps>;

type TextFieldProps = ({
    title: string;
} | {
    label: VirtualNode;
}) & {
    /**
     * The prompt provides guidance on what people should type into the text field.
     */
    prompt?: string;
    /**
     * The axis in which to scroll text when it doesn’t fit in the available space.
     */
    axis?: Axis;
    /**
     * Default to false.
     */
    autofocus?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
} & ({
    value: string;
    onChanged: (value: string) => void;
} | {
    value: Observable<string>;
    onChanged?: never;
});
/**
 *
 */
declare const TextField: FunctionComponent<TextFieldProps>;

type ToggleProps = ({
    /**
     * A boolean value that indicates whether the toggle is on or off.
     */
    value: boolean;
    /**
     * The toggle state changed handler.
     */
    onChanged: (value: boolean) => void;
} | {
    /**
     * A boolean value that indicates whether the toggle is on or off.
     */
    value: boolean;
    /**
     * The AppIntent to execute. AppIntent is only available for `Widget` or `LiveActivity`.
     */
    intent: AppIntent<any, any, AppIntentProtocol>;
    onChanged?: never;
} | {
    value: Observable<boolean>;
    onChanged?: never;
}) & ({
    /**
     * A string that describes the purpose of the toggle.
     */
    title: string;
    /**
     * The name of the image resource to lookup.
     */
    systemImage?: string;
    children?: never;
} | {
    /**
     * A view that describes the purpose of the toggle.
     */
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode;
    title?: never;
    systemImage?: never;
} | {
    title?: never;
    systemImage?: never;
    children?: never;
});
/**
 * A view control that toggles between on and off states.
 */
declare const Toggle: FunctionComponent<ToggleProps>;

declare function Toolbar({ children }: {
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
}): JSX.Element;

type ToolbarItemProps = {
    placement?: ToolbarItemPlacement;
    /**
     * Controls the visibility of the glass background effect on items in the toolbar. In certain contexts, such as the navigation bar on iOS and the window toolbar on macOS, toolbar items will be given a glass background effect that is shared with other items in the same logical grouping.
     */
    sharedBackgroundVisibility?: Visibility;
    children: VirtualNode;
};
/**
 * The toolbar item places in the specified position.
 */
declare const ToolbarItem: FunctionComponent<ToolbarItemProps>;

type ToolbarItemGroupProps = {
    placement?: ToolbarItemPlacement;
    /**
     * Controls the visibility of the glass background effect on items in the toolbar. In certain contexts, such as the navigation bar on iOS and the window toolbar on macOS, toolbar items will be given a glass background effect that is shared with other items in the same logical grouping.
     */
    sharedBackgroundVisibility?: Visibility;
    children: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * The toolbar item places in the specified position.
 */
declare const ToolbarItemGroup: FunctionComponent<ToolbarItemGroupProps>;

/**
 * A type which defines how spacers should size themselves.
 */
type ToolbarSpacerSizing = 'fixed' | 'flexible';
type ToolbarSpacerProps = {
    /**
     * The sizing behavior of the spacer. Defaults to flexible.
     */
    sizing?: ToolbarSpacerSizing;
    /**
     * The placement of the toolbar item. Defaults to automatic.
     */
    placement?: ToolbarItemPlacement;
    /**
     * Controls the visibility of the glass background effect on items in the toolbar. In certain contexts, such as the navigation bar on iOS and the window toolbar on macOS, toolbar items will be given a glass background effect that is shared with other items in the same logical grouping.
     */
    sharedBackgroundVisibility?: Visibility;
};
/**
 * A standard space item in toolbars.
 * @available iOS 26.0+
 */
declare const ToolbarSpacer: FunctionComponent<ToolbarSpacerProps>;

type VideoPlayerProps = {
    /**
     * The player that plays the audiovisual content.
     */
    player: AVPlayer;
    /**
     * A view to present over the player’s video content. This view is fully interactive, but is placed below the system-provided playback controls, and only receives unhandled events.
     */
    overlay?: VirtualNode | null;
};
/**
 * A view that displays content from a player and a native user interface to control playback.
 *
 */
declare const VideoPlayer: FunctionComponent<VideoPlayerProps>;

type VStackProps = {
    /**
     * The guide for aligning the subviews in this stack.
     * This guide has the same vertical screen coordinate for every subview.
     * Default is `center`.
     */
    alignment?: HorizontalAlignment;
    /**
     * The distance between adjacent subviews, or `undefined` if you want the stack to
     * choose a default distance for each pair of subviews.
     */
    spacing?: number;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean | undefined;
};
/**
 * A view that arranges its subviews in a vertical line.
 *
 * @example
 * ```tsx
 * <VStack
 *   alignment="leading"
 *   spacing={10}
 * >
 *   <Image systemName="globe" />
 *   <Text>Item2</Text>
 * </VStack>
 * ```
 */
declare const VStack: FunctionComponent<VStackProps>;

type WebViewProps = {
    /**
     * The controller object for the WebView to control page navigation or evaluate JavaScript code.
     */
    controller: WebViewController;
};
/**
 * An view that displays interactive web content.
 *
 */
declare const WebView: FunctionComponent<WebViewProps>;

type ZStackProps = {
    /**
     * The guide for aligning the subviews in this stack on both the x- and y-axes.
     * Default is `center`
     */
    alignment?: Alignment;
    children?: (VirtualNode | boolean | undefined | null | (VirtualNode | undefined | null | boolean)[])[] | VirtualNode | null | boolean;
};
/**
 * A view that arranges its subviews in a vertical line.
 *
 *
 * @example
 * ```tsx
 * <ZStack
 *   alignment="top"
 * >
 *   <Image sytemName="globe" />
 *   <Text>
 *     Hello world.
 *   </Text>
 * </ZStack>
 * ```
 */
declare const ZStack: FunctionComponent<ZStackProps>;

type UnderlyingSource<R> = {
    start?: (controller: ReadableStreamDefaultController<R>) => void | Promise<void>;
    pull?: (controller: ReadableStreamDefaultController<R>) => void | Promise<void>;
    cancel?: (reason?: any) => void | Promise<void>;
};
/**
 * The `ReadableStreamDefaultController` interface represents a controller allowing control of a `ReadableStream`'s state and internal queue.
 *
 * `ReadableStreamDefaultController` instances are created automatically during `ReadableStream` construction.
 */
declare class ReadableStreamDefaultController<R> {
    private queue;
    private pullAlgorithm;
    private cancelAlgorithm;
    private closeRequested;
    private errorSignaled;
    private _errorReason;
    /**
     * @internal
     */
    constructor(pullAlgorithm?: (controller: ReadableStreamDefaultController<R>) => void | Promise<void>, cancelAlgorithm?: (reason: any) => void | Promise<void>);
    /**
     * Enqueues a given chunk in the associated stream.
     * @param chunk The chunk to enqueue.
     */
    enqueue(chunk: R): void;
    /**
     * Closes the associated stream.
     */
    close(): void;
    /**
     * Causes any future interactions with the associated stream to error.
     * @param e The error you want future interactions to fail with.
     */
    error(e: any): void;
    /**
     * Returns the desired size required to fill the stream's internal queue.
     */
    get desiredSize(): number;
    /**
     * @internal
     */
    dequeue(): R | undefined;
    get closed(): boolean;
    get errored(): boolean;
    get errorReason(): any;
    /**
     * @internal
     */
    cancel(reason: any): void;
}
/**
 * The ReadableStream interface represents a readable stream of some data.
 *
 */
declare class ReadableStream<R> {
    private controller;
    private _locked;
    /**
     * Creates and returns a readable stream object from the given handlers.
     * `ReadableStream` is not a transferable object in Scripting javascript runtime.
     *
     * Note that while all parameters are technically optional, omitting the
     * `underlyingSource` will result in a stream that has no source, and that can't be read from (readers return a promise that will never be resolved).
     *
     * `underlyingSource` is an object containing methods and properties that define how the constructed stream instance will behave, it can contain the following:
     *   - `start?: (controller: ReadableStreamDefaultController)`
     *
     *      This is a method, called immediately when the object is constructed. The contents of this method are defined by the
     *      developer, and should aim to get access to the stream source, and do anything else
     *      required to set up the stream functionality. If this process is to be done asynchronously,
     *      it can return a promise to signal success or failure. The controller parameter passed to this method is a `ReadableStreamDefaultController`.
     *      This can be used by the developer to control the stream during set up.
     *
     *   - `pull?: (controller: ReadableStreamDefaultController)`
     *
     *      This method, also defined by the developer, will be called repeatedly when the stream's internal queue of chunks is not full, up until it reaches its high water mark. If pull() returns a promise, then it won't be called again until that promise fulfills; if the promise rejects, the stream will become errored. The controller parameter passed to this method is a `ReadableStreamDefaultController`. This can be used by the developer to control the stream as more chunks are fetched. This function will not be called until start() successfully completes. Additionally, it will only be called repeatedly if it enqueues at least one chunk or fulfills a BYOB request; a no-op pull() implementation will not be continually called.
     *
     *   - `cancel?: (reason: any)`
     *
     *      This method, also defined by the developer, will be called if the app signals that the stream is to be cancelled (e.g. if ReadableStream.cancel() is called). The contents should do whatever is necessary to release access to the stream source. If this process is asynchronous, it can return a promise to signal success or failure. The reason parameter contains a string describing why the stream was cancelled.
     * @param underlyingSource An object containing methods and properties that define how the constructed stream instance will behave.
     */
    constructor(underlyingSource: UnderlyingSource<R>);
    [Symbol.asyncIterator](): AsyncIterableIterator<R>;
    /**
     * The `locked` read-only property of the `ReadableStream` interface returns whether or not the readable stream is locked to a reader.
     *
     * A readable stream can have at most one active reader at a time, and is locked to that reader until it is released. A reader might be obtained using `ReadableStream.getReader()` and released using the reader's `releaseLock()` method.
     */
    get locked(): boolean;
    /**
     * Creates a reader and locks the stream to it. While the stream is locked, no
     * other reader can be acquired until this one is released.
     */
    getReader(): ReadableStreamDefaultReader<R>;
    /**
     * The `tee` method tees this readable stream, returning a two-element array containing
     * the two resulting branches as new `ReadableStream` instances. Each of those streams
     * receives the same incoming data.
     */
    tee(): [ReadableStream<R>, ReadableStream<R>];
}
/**
 * A `ReadableStreamDefaultReader` can be used to read from a `ReadableStream` that has an underlying source of any type.
 *
 * You generally wouldn't use this constructor manually; instead, you'd use the `ReadableStream.getReader()` method.
 */
declare class ReadableStreamDefaultReader<R> {
    private controller;
    private releaseLockCallback;
    /**
     * @internal
     */
    constructor(controller: ReadableStreamDefaultController<R>, releaseLockCallback: () => void);
    /**
     * The `closed` read-only property of the `ReadableStreamDefaultReader` interface returns a Promise that fulfills when the stream closes, or rejects if the stream throws an error or the reader's lock is released. This property enables you to write code that responds to an end to the streaming process.
     */
    get closed(): Promise<void>;
    /**
     * The cancel() method of the ReadableStreamDefaultReader interface returns a Promise that resolves when the stream is canceled. Calling this method signals a loss of interest in the stream by a consumer.
     * @param reason A human-readable reason for the cancellation. This value may or may not be used.
     */
    cancel(reason?: any): Promise<void>;
    /**
     * The `read()` method of the `ReadableStreamDefaultReader` interface returns a Promise providing access to the next chunk in the stream's internal queue.
     * @returns A Promise, which fulfills/rejects with a result depending on the state of the stream. The different possibilities are as follows:
     *   - If a chunk is available, the promise will be fulfilled with an object of the form `{ value: theChunk, done: false }`.
     *   - If the stream becomes closed, the promise will be fulfilled with an object of the form `{ value: undefined, done: true }`.
     *   - If the stream becomes errored, the promise will be rejected with the relevant error.
     */
    read(): Promise<{
        value: R | undefined;
        done: boolean;
    }>;
    /**
     * The `releaseLock()` method of the `ReadableStreamDefaultReader` interface releases the reader's lock on the stream.
     */
    releaseLock(): void;
}

/**
 * This function is just to make your code more readable.
 *
 * @example
 * ```tsx
 * <Text
 *   foregroundStyle={
 *     gradient("linear", {
 *       colors: ["red", "orange"],
 *       startPoint: "leading",
 *       endPoint: "trailing"
 *     })
 *   }
 * >Hello World!</Text>
 * ```
 */
declare function gradient(gradient: Gradient): Gradient;
declare function gradient(type: "linear", gradient: LinearGradient): LinearGradient;
declare function gradient(type: "radial", gradient: RadialGradient): RadialGradient;
declare function gradient(type: "angular", gradient: AngularGradient): AngularGradient;
declare function gradient(type: "mesh", gradient: MeshGradient): MeshGradient;

/**
 * @internal
 */
type ScriptingDeviceInfo = {
    model: string;
    timeZone: string;
    locale: string;
    systemLocale: string;
    systemLocales: string[];
    systemLanguageTag: string;
    systemLanguageCode: string;
    systemCountryCode?: string;
    systemScriptCode?: string;
    systemName: string;
    systemVersion: string;
    isiPad: boolean;
    isiPhone: boolean;
};

/**
 * A hook use to access current color scheme.
 *
 */
declare function useColorScheme(): ColorScheme;
/**
 * A hook to access the current keyboard visibility state. The hook provides a reactive way to track whether the keyboard is visible.
 */
declare function useKeyboardVisible(): boolean;

type ScenePhase = 'active' | 'inactive' | 'background';
declare class AppEventListenerManager<R> {
    private event;
    /**
     * @internal
     */
    constructor(event: string);
    /**
     * Add event listener.
     */
    addListener(listener: (data: R) => void): void;
    /**
     * Remove event listener
     */
    removeListener(listener: (data: R) => void): void;
}
/**
 *
 */
declare namespace AppEvents {
    /**
     * Observe scene phase changed.
     *
     * @example
     * ```ts
     * AppEvents.scenePhase.addListener((value: ScenePhase) => {
     *   console.log(value)
     * })
     * ```
     */
    const scenePhase: AppEventListenerManager<ScenePhase>;
    /**
     * Observe color scheme changed.
     * @example
     * ```ts
     * AppEvents.colorScheme.addListener((value: ColorScheme) => {
     *   console.log(value)
     * })
     * ```
     */
    const colorScheme: AppEventListenerManager<ColorScheme>;
}

type ControlWidgetLabel = {
    /**
     * The title of the label.
     */
    title: string;
    /**
     * The system image (SFSymbol) of the label.
     */
    systemImage?: string;
    /**
     * Whether the content of the label is redacted when the device is locked.
     */
    privacySensitive?: boolean;
};
type ControlWidgetButtonProps = {
    /**
     * Whether the content and the state of the button are redacted when the device is locked.
     */
    privacySensitive?: boolean;
    /**
     * The intent to execute when the button is tapped.
     */
    intent: AppIntent<any, any, AppIntentProtocol>;
    /**
     * The label of the button.
     */
    label: ControlWidgetLabel;
    /**
     * The label of the button when it is active.
     * If you provide this, you should also provide `inactiveValueLabel`.
     * The `systemImage` will override the `systemImage` in `label`.
     */
    activeValueLabel?: ControlWidgetLabel | null;
    /**
     * The label of the button when it is inactive.
     * If you provide this, you should also provide `activeValueLabel`.
     * The `systemImage` will override the `systemImage` in `label`.
     */
    inactiveValueLabel?: ControlWidgetLabel | null;
};
/**
 * A Control Widget button that can be used to execute an intent.
 */
declare function ControlWidgetButton(props: ControlWidgetButtonProps): JSX.Element;
type ControlWidgetToggleProps<T extends {
    value: boolean;
}> = {
    /**
     * Whether the content and the state of the toggle are redacted when the device is locked.
     */
    privacySensitive?: boolean;
    /**
     * The intent to execute when the toggle is tapped. The `AppIntentProtocol` will force to be `SetValueIntent` in this case, so you can set any protocol you want. The parameter type of the intent must extends `{ value: boolean }`.
     */
    intent: AppIntent<T, any, AppIntentProtocol>;
    /**
     * The label of the toggle.
     */
    label: ControlWidgetLabel;
    /**
     * The label of the toggle when it is active.
     * If you provide this, you should also provide `inactiveValueLabel`.
     * The `systemImage` will override the `systemImage` in `label`.
     */
    activeValueLabel?: ControlWidgetLabel | null;
    /**
     * The label of the toggle when it is inactive.
     * If you provide this, you should also provide `activeValueLabel`.
     * The `systemImage` will override the `systemImage` in `label`.
     */
    inactiveValueLabel?: ControlWidgetLabel | null;
};
/**
 * A Control Widget toggle that can be used to execute an intent.
 */
declare function ControlWidgetToggle<T extends {
    value: boolean;
} = {
    value: boolean;
}>(props: ControlWidgetToggleProps<T>): JSX.Element;
/**
 * This interface allows you to setup the Control Center widget.
 */
declare namespace ControlWidget {
    /**
     * The parameter of the Control Widget that user sets.
     */
    const parameter: string;
    /**
     * Set the content of the Control Widget.
     *
     * You must only use `ControlWidgetButton` or `ControlWidgetToggle` as the element, and `ControlWidgetButton` is used for `control_widget_button.tsx` and `ControlWidgetToggle` is used for `control_widget_toggle.tsx`.
     *
     * You can use `privacySensitive` on root to control whether the content and the state of the button are redacted when the device is locked, if you just want to redact the label or value label, you can use `privacySensitive` on the label or value label.
     *
     * @example
     * ```tsx
     * /// app_intents.tsx
     * export const ToggleDoorIntent = AppIntentManager.resgister({
     *   name: "ToggleDoorIntent",
     *   protocol: AppIntentProtocol.AppIntent,
     *   perform: async ({
     *     id, value
     *   }: {
     *     id: string
     *     value: boolean
     *   }) => {
     *     const data = await setDoorState(doorId, value)
     *     ControlWidget.reloadToggles()
     *   }
     * })
     *
     * /// control_widget_toggle.tsx
     * async function run() {
     *   const doorId = ControlWidget.parameter || "default"
     *   const data = await fetchDoorData(doorId)
     *
     *   ControlWidget.present(
     *     <ControlWidgetToggle
     *       privacySensitive
     *       intent={
     *         ToggleDoorIntent({
     *           id: doorId,
     *           value: !data.doorOpened,
     *         })
     *       }
     *       label={{
     *         title: `Door ${doorId}`,
     *         systemImage: data.doorOpened ? 'door.garage.opened' : 'door.garage.closed',
     *       }}
     *       activeValueLabel={{
     *         title: 'The door is opened',
     *       }}
     *       inactiveValueLabel={{
     *         title: 'The door is closed',
     *       }}
     *     />
     *   )
     * }
     *
     * run()
     * ```
     */
    function present(element: VirtualNode): void;
    /**
     * Reload all control widget buttons.
     */
    function reloadButtons(): void;
    /**
     * Reload all control widget toggles.
     */
    function reloadToggles(): void;
}

/**
 * The text string passed by shortcut action.
 */
type ShortcutTextParameter = {
    value: string;
    type: 'text';
};
/**
 * The json object passed by shortcut action.
 */
type ShortcutJsonParameter = {
    value: any[] | Record<string, any>;
    type: 'json';
};
/**
 * The file URL string passed by shortcut action.
 */
type ShortcutFileURLParameter = {
    value: string;
    type: 'fileURL';
};
/**
 * The parameter can be a text string, a JSON or a file URL string.
 *
 */
type ShortcutParameter = ShortcutFileURLParameter | ShortcutTextParameter | ShortcutJsonParameter;
/**
 * The intent result value.
 *
 */
declare abstract class IntentValue<T extends string, V> {
    abstract type: T;
    abstract value: V;
    toJson(): {
        type: T;
        value: V;
    };
}
/**
 * You can return a text result for the intent.
 */
declare class IntentTextValue extends IntentValue<"text", string> {
    value: string;
    type: "text";
    constructor(value: string, type?: "text");
}
/**
 * You can return a attributed text result for the intent.
 */
declare class IntentAttributedTextValue extends IntentValue<"attributedText", string> {
    value: string;
    type: "attributedText";
    constructor(value: string, type?: "attributedText");
}
/**
 * You can return a URL result for the intent.
 */
declare class IntentURLValue extends IntentValue<"url", string> {
    value: string;
    type: "url";
    constructor(value: string, type?: "url");
}
/**
 * You can return a json for the intent.
 */
declare class IntentJsonValue extends IntentValue<'json', Record<string, any> | any[]> {
    /**
     * A javascript JSON object.
     */
    value: Record<string, any> | any[];
    type: "json";
    constructor(
    /**
     * A javascript JSON object.
     */
    value: Record<string, any> | any[], type?: "json");
}
/**
 * You can return a file path as the result that will be handle as a file.
 */
declare class IntentFileValue extends IntentValue<'file', string> {
    /**
     *  A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    value: string;
    type: "file";
    constructor(
    /**
     *  A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    value: string, type?: "file");
}
/**
 * You can return a file path as the result that will be handle as a fileURL.
 */
declare class IntentFileURLValue extends IntentValue<'fileURL', string> {
    /**
     *  A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    value: string;
    type: "fileURL";
    constructor(
    /**
     *  A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    value: string, type?: "fileURL");
}
declare class IntentSnippetIntentValue extends IntentValue<'SnippetIntent', {
    value?: IntentAttributedTextValue | IntentFileURLValue | IntentJsonValue | IntentTextValue | IntentURLValue | IntentFileValue | null;
    snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
}> {
    value: {
        value?: IntentAttributedTextValue | IntentFileURLValue | IntentJsonValue | IntentTextValue | IntentURLValue | IntentFileValue | null;
        snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
    };
    type: "SnippetIntent";
    constructor(value: {
        value?: IntentAttributedTextValue | IntentFileURLValue | IntentJsonValue | IntentTextValue | IntentURLValue | IntentFileValue | null;
        snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
    }, type?: "SnippetIntent");
}
declare class IntentRequestConfirmationValue extends IntentValue<'RequestConfirmation', {
    actionName: string;
    snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
}> {
    value: {
        actionName: string;
        snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
    };
    type: "RequestConfirmation";
    constructor(value: {
        actionName: string;
        snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
    }, type?: "RequestConfirmation");
}
/**
 * A user request for your service to fulfill.
 *
 * You can create a script with `intent.tsx` file to handle a user request, which you can run in the Scripting app, or as a Shortcuts action, or to handle share sheet input.
 *
 */
declare namespace Intent {
    /**
     * The `intent.tsx` script can run by Shortcuts app, you can read this parameter when you has passed an input parameter.
     *
     * This parameter can be a JSON object, any text, or a file URL string, when you passing a file, the action will attemp to read the file as JSON or a text string. If the file cannot be read as JSON or a text string, the file URL string will be passed as the input parameter.
     * You can check `ShortcutParameter.type` to know the type of the value.
     */
    const shortcutParameter: ShortcutParameter | undefined;
    /**
     * The text string array passed from a share sheet or a shortcut action.
     *
     * If you have enabled `Text` as a intent input from the Intent Settings, when the system shares text, the script will be displayed in the share sheet and can be selected to run.
     */
    const textsParameter: string[] | undefined;
    /**
     * The URL string array passed from a share sheet or a shortcut action.
     *
     * If you have enabled `URLs` as a intent input from the Intent Settings, when the system shares URLs, the script will be displayed in the share sheet and can be selected to run.
     */
    const urlsParameter: string[] | undefined;
    /**
     * The image file path string array passed from a share sheet or a shortcut action.
     *
     * If you have enabled `Images` as a intent input from the Intent Settings, when the system shares Images, the script will be displayed in the share sheet and can be selected to run.
     *
     * When large images are passed from a share sheet or a shortcut action, the system may terminate the process due to memory constraints. In this case you should use `Run Script in App` action in Shortcuts app or enable the `Run in App` option in `Intent Inputs` settings.
     */
    const imagesParameter: UIImage[] | undefined;
    /**
     * The file path string array passed from a share sheet or a shortcut action.
     *
     * If you have enabled `FileURLs` as a intent input from the Intent Settings, when the system shares Files, the script will be displayed in the share sheet and can be selected to run.
     *
     * When large files are passed from a share sheet or a shortcut action, the system may terminate the process due to memory constraints. In this case you should use `Run Script in App` action in Shortcuts app or enable the `Run in App` option in `Intent Settings`.
     */
    const fileURLsParameter: string[] | undefined;
    /**
     * Wrap a `text` value for intent result.
     * @param value A text string.
     */
    function text(value: string | number | boolean): IntentTextValue;
    /**
     * Wrap a `attributedText` value for intent result.
     * @param value A text string.
     */
    function attributedText(value: string): IntentAttributedTextValue;
    /**
     * Wrap a `text` value for intent result.
     * @param value A text string.
     */
    function url(value: string): IntentURLValue;
    /**
     * Wrap a `JSON` value for the intent result.
     */
    function json(value: Record<string, any> | any[]): IntentJsonValue;
    /**
     * Wrap a `file` value for intent result.
     * @param filePath  A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    function file(filePath: string): IntentFileValue;
    /**
     * Wrap a `fileURL` value for intent result.
     * @param filePath A file path pointing to a file stored in iCloud or App Group Documents folder.
     */
    function fileURL(filePath: string): IntentFileURLValue;
    /**
     * Wrap a `value` and `snippetIntent` value for intent result.
     * @param intent A SnippetIntent to perform and return a snippet view and a value.
     */
    function snippetIntent(options: {
        value?: IntentAttributedTextValue | IntentFileURLValue | IntentJsonValue | IntentTextValue | IntentURLValue | IntentFileValue | null;
        snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>;
    }): IntentSnippetIntentValue;
    type ConfirmationActionName = "add" | "addData" | "book" | "buy" | "call" | "checkIn" | "continue" | "create" | "do" | "download" | "filter" | "find" | "get" | "go" | "log" | "open" | "order" | "pay" | "play" | "playSound" | "post" | "request" | "run" | "search" | "send" | "set" | "share" | "start" | "startNavigation" | "toggle" | "turnOff" | "turnOn" | "view";
    /**
     * The text you want the system to display, or speak, when requesting a value, asking for disambiguation, or confirming an action.
     *  - `full`: a standalone message that fully describes the output
     *  - `supporting`: a message that may be used in conjunction with visual output
     *  - `systemImageName`: an SF Symbol that may be be used to represent the result
     */
    type Dialog = string | {
        full: string;
        supporting: string;
    } | {
        full: string;
        supporting: string;
        systemImageName: string;
    } | {
        full: string;
        systemImageName: string;
    };
    /**
     * Request the user to confirm an action. If the user cancels the action, the script will be terminated.
     * @param actionName The name of the action
     * @param snippetIntent An SnippetIntent to display
     * @param options The dialog options
     * @param options.dialog The dialog to display
     * @param options.showDialogAsPrompt Whether to show the dialog as a prompt, defaults to `true`.
     */
    function requestConfirmation(actionName: ConfirmationActionName, snippetIntent: AppIntent<any, VirtualNode, AppIntentProtocol.SnippetIntent>, options?: {
        dialog?: Dialog;
        showDialogAsPrompt?: boolean;
    }): Promise<void>;
    /**
     * Request the user to continue in the foreground. If the user cancels the action, the script will be terminated.
     * @param dialog The dialog to display
     * @param options The dialog options
     * @param options.alwaysConfirm Whether to always confirm, defaults to `false`.
     */
    function continueInForeground(dialog?: Dialog | null, options?: {
        alwaysConfirm?: boolean;
    }): Promise<void>;
}

type ImageRenderOptions = {
    /**
     * A Boolean value that indicates whether the underlying Core Graphics context has an alpha channel. Defaults to false.
     */
    opaque?: boolean;
    /**
     * The display scale of the image renderer context. The default value is equal to the `scale` of the main screen.
     */
    scale?: number;
};
/**
 * The interface that creates images from views.
 *
 */
declare namespace ImageRenderer {
    /**
     * Render view to an image.
     */
    function toUIImage(element: VirtualNode, options?: ImageRenderOptions): Promise<UIImage>;
    /**
     * Render view to a PNG data.
     */
    function toPNGData(element: VirtualNode, options?: ImageRenderOptions): Promise<Data>;
    /**
     * Render view to a JPEG data.
     */
    function toJPEGData(element: VirtualNode, options?: ImageRenderOptions & {
        /**
         * A number value between 0.0 and 1.0, representing the compression level the JPEG encoder should use. A value of 1.0 specifies lossless compression, and a value of 0.0 specifies maximum compression. Defaults to 1.0.
         */
        compressionQuality?: number;
    }): Promise<Data>;
}

/**
 * The state of a Live Activity in its life cycle.
 *
 *  - `active`: The Live Activity is active, visible, and can receive content updates.
 *  - `ended`: The Live Activity is visible, but a person, app, or system ended it, and it won't update its content anymore.
 *  - `dismissed`: The Live Activity ended and is no longer visible because a person or the system removed it.
 *  - `stale`: The Live Activity content is out of date and needs an update.
 *
 */
type LiveActivityState = 'active' | 'dismissed' | 'ended' | 'stale';
/**
 * LiveActivity state details.
 */
type LiveActivityDetail = {
    /**
     * Activity ID.
     */
    id: string;
    /**
     * Activity state.
     */
    state: LiveActivityState;
};
type LiveActivityActivitiesEnabledListener = (enabled: boolean) => void;
type LiveActivityActivityUpdateListener = (detail: LiveActivityDetail) => void;
type LiveActivityUIExpandedViewProps = {
    children: VirtualNode;
};
/**
 * Live Activity ui description object.
 */
type LiveActivityUIProps = {
    /**
     * Create the presentation that appears on the Lock Screen and as a banner on the Home Screen of devices that don't support the Dynamic Island.
     */
    content: VirtualNode;
    /**
     * The view for the compact leading presentation of the Live Activity.
     */
    compactLeading: VirtualNode;
    /**
     * The view for the compact trailing presentation of the Live Activity.
     */
    compactTrailing: VirtualNode;
    /**
     * The minimal presentation of the Live Activity.
     * ![Dynamic Island minimal](https://docs-assets.developer.apple.com/published/c97586d2d3296e4c0b95c6a59c3d5127/minimal-view@2x.png)
     */
    minimal: VirtualNode;
    /**
     * The views for the expanded presentation of the Live Activity.
     * ![Dynamic Island Expanded](https://docs-assets.developer.apple.com/published/dec913bb4b4e8771fc8e55dbd4bdfb41/expanded-layout@2x.png)
     */
    children: VirtualNode | VirtualNode[];
};
/**
 * Live Activity UI builder function.
 * The `LiveActivityUIBuilder` create the content that appears in your Live Activity. Its type `T` represents the dynamic contentState for rendering of the Live Activity.
 */
interface LiveActivityUIBuilder<T> {
    (contentState: T): VirtualNode;
}
type LiveActivityOptions = {
    /**
     * The date(timestamp) or Date object when the system considers the Live Activity to be out of date.
     * When time reaches the configured stale date, the system considers the
     * Live Activity out of date, and the activity state changes to `stale`.
     */
    staleDate?: number | Date;
    /**
     * A score you assign that determines the order in which your Live Activities
     * appear when you start several Live Activities for your script.
     *
     * If you start more than one Live Activity in your script, the Live Activity
     * with the highest relevance score appears in the Dynamic Island. If Live Activities
     * have the same relevance score, the system displays the Live Activity
     * that started first. Additionally, the `relevanceScore`
     * determines the order of your Live Activities on the Lock Screen.
     */
    relevanceScore?: number;
};
type LiveActivityUpdateOptions = LiveActivityOptions & {
    /**
     * The alert configuration you use to configure how the system notifies a person about the updated content of the Live Activity.
     */
    alert?: {
        /**
         * A short title that describes the purpose of the Live Activity update on Apple Watch.
         *
         * Apple Watch displays this string briefly as part of the alert that appears
         * when you update a Live Activity and choose to alert people about the update.
         * Choose text that's easy to read at a glance. For example, a pizza delivery app could use "On the way."
         */
        title: string;
        /**
         * The main text that appears on the alert for a Live Activity update on Apple Watch.
         *
         * Apple Watch displays this string briefly as part of the alert that appears
         * when you update a Live Activity and choose to alert people about the update.
         * Choose text that's easy to read at a glance. For example, a pizza delivery app could use
         * "Your order will arrive in 25 minutes."
         */
        body: string;
    };
};
type LiveActivityEndOptions = LiveActivityOptions & {
    /**
     * - If `dismissTimeInterval` not given, will use the system's default dismissal policy for the Live Activity. With the default dismissal policy, the system keeps a Live Activity that ended on the Lock Screen for
     * up to four hours after it ends or a person removes it.
     * - If `dismissTimeInterval <= 0`, will use the `immediate` dismissal policy, the system immediately removes the ended Live Activity.
     * - If `dismissTimeInterval > 0`, will tell the system removes a Live Activity that ended after the specified date(`Date.now() + dismissTimeInterval`) or after four
     * hours from the moment the Live Activity ended — whichever comes first.
     */
    dismissTimeInterval?: DurationInSeconds;
};

/**
 * Display your Script’s data in the Dynamic Island and on the Lock Screen and offer quick interactions.
 */
declare class LiveActivity<T> {
    private static _builderMap;
    static register<T>(name: string, builder: LiveActivityUIBuilder<T>): () => LiveActivity<T>;
    private static build;
    private static _renderView;
    name: string;
    private _updateListeners;
    private _updateListenerId?;
    private _activityId?;
    private _started;
    /**
     * The activity ID, you should access this property after `start` executed successfully.
     */
    get activityId(): string | undefined;
    /**
     * A boolean value that indicates whether the `start` method has been called.
     */
    get started(): boolean;
    /**
     * Requests and starts a Live Activity.
     * @param contentState An object that describes the dynamic contentState of the Live Activity that changes over time, it must be JSON serializable.
     * @param options The options object to setup the live activity.
     * @returns A boolean value that indicates whether the action was successfull.
     */
    start(contentState: T, options?: LiveActivityOptions): Promise<boolean>;
    /**
     * Updates the dynamic content of the Live Activity and alerts a person about the Live Activity update.
     * @param contentState The updated dynamic contentState for the Live Activity, it must be JSON serializable.
     * @param options The options object to update the live activity.
     * @returns A boolean value that indicates whether the update was successfull.
     */
    update(contentState: T, options?: LiveActivityUpdateOptions): Promise<boolean>;
    /**
     * Ends an active Live Activity.
     * @param contentState The latest and final dynamic contentState for the Live Activity that ended, it must be JSON serializable.
     * @param options The options object to end the live activity.
     * @returns A boolean value that indicates whether the action was successfull.
     */
    end(contentState: T, options?: LiveActivityEndOptions): Promise<boolean>;
    /**
     * Get the current state of the Live Activity in its life cycle.
     */
    getActivityState(): Promise<LiveActivityState | null>;
    /**
     * Add listener to observe changes.
     */
    addUpdateListener(listener: (state: LiveActivityState) => void): void;
    /**
     * Remove `activityUpdate` listener.
     */
    removeUpdateListener(listener: (state: LiveActivityState) => void): void;
    private _updateListener;
    /**
     * Get a boolean value that indicates whether your script can start a Live Activity.
     */
    static areActivitiesEnabled(): Promise<boolean>;
    private static _activitiesEnabledListeners;
    private static _activitiesEnabledListenerId?;
    private static _activityUpdateListeners;
    private static _activityUpdateListenerId?;
    /**
     * You can retrieve an LiveActivity instance by an `activityId`. You can use this method when your script loses the context of the LiveActivity after re-running it.
     * @param activityId The ID of an activity.
     * @param name The name of a LiveActivity which you registered.
     * @returns A promise that will resolve a existing LiveActivity instance or null.
     */
    static from<T>(activityId: string, name: string): Promise<LiveActivity<T> | null>;
    /**
     * Add listener to observe whether your script can start a Live Activity.
     */
    static addActivitiesEnabledListener(listener: LiveActivityActivitiesEnabledListener): void;
    /**
     * Remove `activitiesEnabled` state listener.
     */
    static removeActivitiesEnabledListener(listener: LiveActivityActivitiesEnabledListener): void;
    private static _activitiesEnabledListener;
    /**
     * Add listener to observe changes to ongoing Live Activities.
     */
    static addActivityUpdateListener(listener: LiveActivityActivityUpdateListener): void;
    /**
     * Remove `activityUpdate` listener.
     */
    static removeActivityUpdateListener(listener: LiveActivityActivityUpdateListener): void;
    private static _activityUpdateListener;
    /**
     * Get the current state of the target Live Activity in its life cycle.
     */
    static getActivityState(activityId: string): Promise<LiveActivityState | null>;
    /**
     * An array of the Scripting app’s current Live Activities.
     */
    static getAllActivities(): Promise<LiveActivityDetail[]>;
    /**
     * An array of the Scripting app’s current Live Activities IDs.
     */
    static getAllActivitiesIds(): Promise<string[]>;
    /**
     * Ends all active Live Activities.
     * @param options
     * @returns A boolean value that indicates whether the action was successfull.
     */
    static endAllActivities(options?: LiveActivityEndOptions): Promise<boolean>;
}
declare function LiveActivityUI(props: LiveActivityUIProps): JSX.Element;
declare function LiveActivityUIExpandedLeading(props: LiveActivityUIExpandedViewProps): JSX.Element;
declare function LiveActivityUIExpandedTrailing(props: LiveActivityUIExpandedViewProps): JSX.Element;
declare function LiveActivityUIExpandedCenter(props: LiveActivityUIExpandedViewProps): JSX.Element;
declare function LiveActivityUIExpandedBottom(props: LiveActivityUIExpandedViewProps): JSX.Element;

/**
 * Constants that indicate the importance and delivery timing of a notification.
 *  - `active`: The system presents the notification immediately, lights up the screen, and can play a sound.
 *  - `passive`: The system adds the notification to the notification list without lighting up the screen or playing a sound.
 *  - `timeSensitive`: The system presents the notification immediately, lights up the screen, can play a sound, and breaks through system notification controls.
 */
type NotificationInterruptionLevel = "active" | "passive" | "timeSensitive";
/**
 * A task your script performs in response to a notification that the system delivers.
 */
type NotificationAction = {
    /**
     * The system displays this string as the title of a button, which the system adds to the notification interface. This parameter must not be null.
     */
    title: string;
    /**
     * The SFSymbol name of the action icon.
     */
    icon?: string;
    /**
     * When user tap the action button and the url will be open. You can provide a Scripting run script url scheme to handle the action, or a https:// url to open system browser.
     */
    url: string;
    /**
     * The action performs a destructive task.
     */
    destructive?: boolean;
};
interface NotificationRequest {
    /**
     * The unique identifier for this notification request.
     */
    identifier: string;
    /**
     * The content associated with the notification.
     */
    content: {
        /**
         * The notification title.
         */
        title: string;
        /**
         * The notification subtitle.
         */
        subtitle: string;
        /**
         * The notification body.
         */
        body: string;
        /**
         * The custom data to associate with the notification.
         */
        userInfo: Record<string, any>;
        /**
         * The identifier that groups related notifications.
         */
        threadIdentifier: string;
    };
    /**
     * The conditions that trigger the delivery of the notification.
     */
    trigger: CalendarNotificationTrigger | LocationNotificationTrigger | TimeIntervalNotificationTrigger | null;
}
interface NotificationInfo {
    /**
     * The delivery date of the notification.
     */
    date: Date;
    /**
     * The notification request that this notification is based on.
     */
    request: NotificationRequest;
    /**
     * The unique identifier for this notification request.
     * @deprecated
     * Use `request.identifier` instead.
     */
    identifier: string;
    /**
     * The delivery timestamp of the notification.
     * @deprecated
     * Use `date.getTime()` instead.
     */
    deliveryTime: number;
    /**
     * The notification title.
     * @deprecated
     * Use `request.content.title` instead.
     */
    title: string;
    /**
     * The notification subtitle.
     * @deprecated
     * Use `request.content.subtitle` instead.
     */
    subtitle: string;
    /**
     * The notification body.
     * @deprecated
     * Use `request.content.body` instead.
     */
    body: string;
    /**
     * The custom data to associate with the notification.
     * @deprecated
     * Use `request.content.userInfo` instead.
     */
    userInfo: Record<string, any>;
    /**
     * The identifier that groups related notifications.
     * @deprecated
     * Use `request.content.threadIdentifier` instead.
     */
    threadIdentifier: string;
}
/**
 * The interface for managing notification-related activities.
 */
declare namespace Notification {
    /**
     * If the script is opened by tapping on a notification, you can access this property to get information about the notification.
     */
    const current: NotificationInfo | null;
    /**
     * Represents an icon that uses a system image with specific color.
     */
    type SystemImageIcon = {
        systemImage: string;
        color: Color;
    };
    /**
     * Schedules the delivery of a local notification.
     * When the user directly taps on the notification, the Scripting app will be opened and the script that invokes the notification will be run. You can access the notification information through `Notification.current` when the script starts.
     *
     * When the user long presses or pulls down the notification, if you set `actions`, the action button will be displayed. After the user taps on an action button, the URL you provided will be redirected. You can provide the URL scheme of the Scripting app or an accessible https link.
     *
     * If `customUI` is set to true, long press or pull down the notification and the `notification.tsx` under the script will be run. You can use `Notification.present` to display the custom UI in this file, and provide interactive components such as buttons or input boxes for users to complete specific functions.
     *
     * @param options The options for scheduling the notification.
     * @param options.title The title of the notification.
     * @param options.subtitle The subtitle of the notification.
     * @param options.body The body of the notification.
     * @param options.badge The badge count for the app icon.
     * @param options.silent If true, the notification will be delivered silently without sound. Defaults to false.
     * @param options.iconImageData The custom notification icon image data, you can use it to replace the default icon, or use `SystemImageIcon` to use a system image with specific color.
     * @param options.interruptionLevel The importance and delivery timing of the notification.
     * @param options.userInfo Custom information associated with the notification.
     * @param options.threadIdentifier A string to group related notifications.
     * @param options.trigger The trigger that determines when the system delivers the notification.
     * @param options.actions The actions to display when the system delivers notifications of this type.
     * @param options.customUI Specify true to run the `notification.tsx` file of the current script when user long press or drag down the notification.
     * @param options.tapAction The action to perform when the user taps the notification. If not specified, the default behavior is to run the current script.
     *  - `"none"`: Do nothing when the user taps the notification.
     *  - `{ type: "runScript", scriptName: string }`: Run the specified script when the user taps the notification.
     *  - `{ type: "openURL", url: string }`: Open the specified URL when the user taps the notification. You can provide a deeplink to open another app, or a https:// link to open system browser.
     * @returns A promise that resolves to true if the notification was successfully scheduled, or false otherwise.
     */
    function schedule(options: {
        title: string;
        subtitle?: string;
        body?: string;
        badge?: number;
        silent?: boolean;
        iconImageData?: Data | SystemImageIcon | null;
        interruptionLevel?: NotificationInterruptionLevel;
        userInfo?: Record<string, any>;
        threadIdentifier?: string;
        trigger?: CalendarNotificationTrigger | LocationNotificationTrigger | TimeIntervalNotificationTrigger | null;
        actions?: NotificationAction[];
        customUI?: boolean;
        tapAction?: "none" | {
            type: "runScript";
            scriptName: string;
        } | {
            type: "openURL";
            url: string;
        };
    }): Promise<boolean>;
    /**
     * Fetches all delivered notifications that are still present in Notification Center.
     */
    function getAllDelivereds(): Promise<NotificationInfo[]>;
    /**
     * Fetches all local notifications that are pending delivery.
     */
    function getAllPendings(): Promise<NotificationRequest[]>;
    /**
     * Removes all delivered notifications from Notification Center.
     */
    function removeAllDelivereds(): Promise<void>;
    /**
     * Removes all pending local notifications.
     */
    function removeAllPendings(): Promise<void>;
    /**
     * Removes notifications from Notification Center that match the specified identifiers.
     */
    function removeDelivereds(identifiers: string[]): Promise<void>;
    /**
     * Removes local notifications that are pending and match the specified identifiers.
     */
    function removePendings(identifiers: string[]): Promise<void>;
    /**
     * Fetches all of the current script's delivered notifications that are still present in Notification Center.
     */
    function getAllDeliveredsOfCurrentScript(): Promise<NotificationInfo[]>;
    /**
     * Fetches all of the current script's local notifications that are pending delivery.
     */
    function getAllPendingsOfCurrentScript(): Promise<NotificationRequest[]>;
    /**
     * Removes all of the current script's notifications from Notification Center that match the specified identifiers.
     */
    function removeAllDeliveredsOfCurrentScript(): Promise<void>;
    /**
     * Removes all of the current script's pending local notifications.
     */
    function removeAllPendingsOfCurrentScript(): Promise<void>;
    /**
     * Updates the badge count for the Scripting app’s icon.
     */
    function setBadgeCount(count: number): Promise<boolean>;
    /**
     * Present a custom UI for rich notification. This method should only use in `notification.tsx` of the script.
     */
    function present(node: VirtualNode): Promise<void>;
}

/**
 * Modal presentation styles available when presenting view controllers.
 */
type ModalPresentationStyle = 'automatic' | 'currentContext' | 'formSheet' | 'fullScreen' | 'overCurrentContext' | 'overFullScreen' | 'pageSheet';
declare namespace Navigation {
    /**
     * Presents a view controller modally. The promise will be fulfilled after the view controller dismissed.
     */
    function present<T = any>(options: VirtualNode | {
        element: VirtualNode;
        modalPresentationStyle?: ModalPresentationStyle;
    }): Promise<T>;
    function useDismiss(): (result?: any) => void;
}

/**
 * The interface provides utilities for working with file and directory paths.
 *
 * See also:
 * * https://nodejs.org/docs/v10.3.0/api/path.html
 */
declare namespace Path {
    const sep = "/";
    const delimiter = ":";
    /**
     * The `Path.normalize()` method normalizes the given path, resolving '..' and '.' segments.
     * @example
     * ```ts
     * Path.normalize('/foo/bar//baz/asdf/quux/..')
     * // Returns: '/foo/bar/baz/asdf'
     * ```
     */
    function normalize(path: string): string;
    /**
     * The `Path.isAbsolute()` method determines if path is an absolute path.
     *
     * If the given path is a zero-length string, false will be returned.
     */
    function isAbsolute(path: string): boolean;
    /**
     * The `Path.join()` method joins all given path segments together using the platform
     * specific separator as a delimiter, then normalizes the resulting path.
     *
     * Zero-length path segments are ignored. If the joined path string is a zero-length
     * string then '.' will be returned, representing the current working directory.
     */
    function join(...args: string[]): string;
    /**
     * The path.dirname() method returns the directory name of a path.
     * @example
     * ```ts
     * Path.dirname('/foo/bar/baz/asdf/quux')
     * // Returns: '/foo/bar/baz/asdf'
     * ```
     */
    function dirname(path: string): string;
    /**
     * The `Path.basename()` methods returns the last portion of a path, similar to the Unix basename command.
     * Trailing directory separators are ignored, see `Path.sep`.
     */
    function basename(path: string, ext?: string): string;
    /**
     * The `Path.extname()` method returns the extension of the path, from the last occurrence
     * of the . (period) character to end of string in the last portion of the path.
     * If there is no . in the last portion of the path, or if the first character of
     * the basename of path (see `Path.basename()`) is ., then an empty string is returned.
     */
    function extname(path: string): string;
    /**
     * The `Path.parse()` method returns an object whose properties represent significant elements of the path.
     */
    function parse(path: string): {
        root: string;
        dir: string;
        base: string;
        ext: string;
        name: string;
    };
}

interface Cookie {
    name: string;
    value: string;
    domain: string;
    path: string;
    isSecure: boolean;
    isHTTPOnly: boolean;
    isSessionOnly: boolean;
    expiresDate?: Date | null;
}
interface RedirectRequest {
    method: string;
    url: string;
    headers: Record<string, string>;
    cookies: Cookie[];
    body?: Data;
    timeout?: number;
}

/**
 * Provides a way to easily construct a set of key/value pairs representing form fields and their values, which can then be easily sent using the XMLHttpRequest.send() method. It uses the same format a form would use if the encoding type were set to "multipart/form-data".
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/FormData)
 */
declare class FormData {
    private formData;
    append(name: string, value: string): void;
    append(name: string, value: Data, mimeType: string, filename?: string): void;
    get(name: string): string | Data | null;
    getAll(name: string): any[];
    has(name: string): boolean;
    delete(name: string): void;
    set(name: string, value: string): void;
    set(name: string, value: Data, filename?: string): void;
    forEach(callback: (value: any, name: string, parent: FormData) => void): void;
    entries(): [string, any][];
    toJson(): Record<string, any>;
}
/**
 * Converts a FormData object to a JSON object.
 * Each key in the FormData is mapped to its corresponding value, which can be a string, Data, or an object containing a Data instance with optional filename and mimeType.
 * @param formData The FormData object to convert.
 * @returns A JSON object representation of the FormData.
 * @deprecated
 * This function is deprecated. Use `FormData.toJson()` method instead.
 */
declare function formDataToJson(formData: FormData): Record<string, any>;

type HeadersInit = [string, string][] | Record<string, string> | Headers;
/**
 * This Fetch API interface allows you to perform various actions on HTTP request and response headers. These actions include retrieving, setting, adding to, and removing. A Headers object has an associated header list, which is initially empty and consists of zero or more name and value pairs.  You can add to this using methods like append() (see Examples.) In all methods of this interface, header names are matched by case-insensitive byte sequence.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Headers)
 */
declare class Headers {
    private map;
    constructor(init?: HeadersInit);
    append(name: string, value: string): void;
    get(name: string): string | null;
    has(name: string): boolean;
    set(name: string, value: string): void;
    delete(name: string): void;
    forEach(callback: (value: string, name: string) => void): void;
    keys(): string[];
    values(): string[];
    entries(): [string, string][];
    toJson(): {
        [x: string]: string;
    };
}

type ResponseInit = {
    status?: number;
    statusText?: string;
    headers?: HeadersInit;
    cookies?: Cookie[];
    url?: string;
    mimeType?: string;
    expectedContentLength?: number;
    textEncodingName?: string;
};
/**
 * This Fetch API interface represents the response to a request.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/Response)
 */
declare class Response {
    private _status;
    private _statusText;
    private _headers;
    private _cookies;
    private _ok;
    private _url?;
    private _mimeType?;
    private _expectedContentLength?;
    private _textEncodingName?;
    readonly body: ReadableStream<Data>;
    /**
     * @internal
     */
    constructor(body: ReadableStream<Data>, init?: ResponseInit);
    get bodyUsed(): boolean;
    get cookies(): Cookie[];
    json(): Promise<any>;
    text(): Promise<string>;
    data(): Promise<Data>;
    bytes(): Promise<Uint8Array>;
    arrayBuffer(): Promise<ArrayBuffer>;
    formData(): Promise<FormData>;
    /**
     * Get response status code.
     */
    get status(): number;
    /**
     * Get response status text.
     */
    get statusText(): string;
    /**
     * Get response headers.
     */
    get headers(): Headers;
    /**
     * Whether response is ok.
     */
    get ok(): boolean;
    /**
     * Get response URL.
     */
    get url(): string;
    /**
     * Get response mime type.
     */
    get mimeType(): string | undefined;
    /**
     * Get response expected content length.
     */
    get expectedContentLength(): number | undefined;
    /**
     * Get response text encoding name.
     */
    get textEncodingName(): string | undefined;
}

/** Error thrown when an operation is aborted */
declare class AbortError extends Error {
    name: string;
    constructor(message?: string);
}
/** Event representing an abort, analogous to the browser's AbortEvent */
declare class AbortEvent {
    readonly type = "abort";
    readonly target: AbortSignal;
    constructor(signal: AbortSignal);
}
/** Listener callback invoked when an AbortEvent is dispatched */
type AbortEventListener = (event: AbortEvent) => void;
/**
 * Allows communicating with and aborting DOM requests (e.g., fetch).
 */
declare class AbortSignal {
    private _aborted;
    private _reason?;
    private listeners;
    /** Optional callback for the 'abort' event */
    onabort: AbortEventListener | null;
    /** Indicates whether the signal has been aborted */
    get aborted(): boolean;
    /** The reason why the signal was aborted */
    get reason(): any;
    /**
     * Internal method to trigger the abort state and notify listeners
     * @internal
     */
    _dispatchAbort(reason?: any): void;
    /** Throws an AbortError if the signal has already been aborted */
    throwIfAborted(): void;
    /** Adds a listener for the 'abort' event */
    addEventListener(type: 'abort', listener: AbortEventListener): void;
    /** Removes a previously added 'abort' event listener */
    removeEventListener(type: 'abort', listener: AbortEventListener): void;
    /**
     * Creates a signal that is already aborted with an optional reason
     */
    static abort(reason?: any): AbortSignal;
    /**
     * Returns a signal that will abort after the given delay (in milliseconds)
     */
    static timeout(delay: number): AbortSignal;
    /**
     * Returns a signal that will abort when any of the provided signals abort
     */
    static any(signals: AbortSignal[]): AbortSignal;
}
/**
 * Controller object that allows aborting one or more DOM requests
 */
declare class AbortController {
    /** The AbortSignal object associated with this controller */
    readonly signal: AbortSignal;
    constructor();
    /**
     * Aborts the associated signal, setting the reason if provided
     * @param reason - Optional reason for abort, defaults to an AbortError
     */
    abort(reason?: any): void;
}

type CancelEventListener = (reason?: any) => void;
declare class CancelError extends Error {
    name: string;
    constructor(message?: string);
}
/**
 * Controls cancellation of requests.
 *
 * The same token can be shared between different requests.
 * When `cancel` is invoked, requests bound to this token will be cancelled.
 */
declare class CancelToken {
    readonly token: string;
    private _isCancelled;
    private listeners;
    oncancel: CancelEventListener | null;
    /**
     * Whether the token is cancelled.
     */
    get isCancelled(): boolean;
    /**
     * Cancel the request.
     */
    cancel(reason?: any): void;
    addEventListener(type: 'cancel', listener: CancelEventListener): void;
    removeEventListener(type: 'cancel', listener: CancelEventListener): void;
}
type CancelTokenHook = {
    /**
     * Get the `CancelToken` instance, if `create` hasn't been called, it would return `undefined`.
     */
    get(): CancelToken | undefined;
    /**
     * Create a `CancelToken` instance, if `create` was called, it return the exists instance,
     * otherwise a new instance will be create.
     */
    create(): CancelToken;
};
/**
 * If you want to use `CancelToken` in `FunctionComponent`, use this hook.
 *
 *
 * @example
 * ```tsx
 * function App() {
 *   const cancelToken = useCancelToken()
 *
 *   async function request() {
 *     // Cancel last request
 *     cancelToken.get()?.cancel()
 *
 *     const result = await fetch('https://example.com', {
 *      // Create a new `CancelToken` instance
 *       cancelToken: cancelToken.create(),
 *     })
 *     // ...
 *   }
 *
 *   return (
 *     <CupertinoButton
 *       onPressed={request}
 *     >
 *      <Text>Request</Text>
 *     </CupertinoButton>
 *   )
 * }
 * ```
 */
declare function useCancelToken(): CancelTokenHook;

type RequestInit = {
    method?: string;
    headers?: HeadersInit;
    body?: Data | FormData | string | ArrayBuffer;
    /**
     * Whether to allow insecure request, default is false.
     * If the request URL is HTTP and the app is served over HTTPS, the request will be blocked unless this option is set to true.
     */
    allowInsecureRequest?: boolean;
    /**
     * A callback function that is called when a redirect response is received.
     * The function receives the new Request as an argument and should return a Promise that resolves to a `RedirectRequest` or null. If returns null, the redirect will be canceled. If the function is not provided, all redirects will be allowed by default.
     */
    handleRedirect?: (newRequest: RedirectRequest) => Promise<RedirectRequest | null>;
    /**
     * A function that is called when a redirect response is received. The function receives the new Request as an argument and should return a Promise that resolves to a boolean indicating whether to allow the redirect. If the function is not provided, all redirects will be allowed by default.
     *
     * @deprecated
     * Use `handleRedirect` instead.
     */
    shouldAllowRedirect?: (newRequest: Request) => Promise<boolean>;
    /**
     * Request timeout in seconds.
     */
    timeout?: DurationInSeconds;
    /**
     * If this option is set, the request can be canceled by calling abort() on the corresponding AbortController.
     */
    signal?: AbortSignal;
    /**
     * `CancelToken` instance, you can call the `cancel` method at the appropriate time to cancel the request.
     * @deprecated
     * Use `signal` instead.
     */
    cancelToken?: CancelToken;
    /**
     * Debug label will display in log panel.
     */
    debugLabel?: string;
};
/**
 * The Request interface of the Fetch API represents a resource request.
 */
declare class Request {
    url: string;
    method: string;
    headers: Headers;
    body?: Data | FormData | string | ArrayBuffer;
    /**
     * Whether to allow insecure request, default is false.
     * If the request URL is HTTP and the app is served over HTTPS, the request will be blocked unless this option is set to true.
     */
    allowInsecureRequest?: boolean;
    /**
     * A callback function that is called when a redirect response is received.
     * The function receives the new Request as an argument and should return a Promise that resolves to a `RedirectRequest` or `null`.
     * If returns `null`, the redirect will be canceled.
     * If the function is not provided, all redirects will be allowed by default.
     */
    handleRedirect?: (newRequest: RedirectRequest) => Promise<RedirectRequest | null>;
    /**
     * A function that is called when a redirect response is received. The function receives the new Request as an argument and should return a Promise that resolves to a boolean indicating whether to allow the redirect. If the function is not provided, all redirects will be allowed by default.
     *
     * @deprecated
     * Use `handleRedirect` instead.
     */
    shouldAllowRedirect?: (newRequest: Request) => Promise<boolean>;
    /**
     * Request timeout in seconds.
     */
    timeout?: DurationInSeconds;
    /**
     * If this option is set, the request can be canceled by calling abort() on the corresponding AbortController.
     */
    signal?: AbortSignal;
    /**
     * `CancelToken` instance, you can call the `cancel` method at the appropriate time to cancel the request.
     * @deprecated
     * Use `signal` instead.
     */
    cancelToken?: CancelToken;
    /**
     * Debug label will display in log panel.
     */
    debugLabel?: string;
    constructor(input: string | Request, init?: RequestInit);
    clone(): Request;
}

/**
 * The fetch() method starts the process of fetching a resource from the network,
 * returning a promise that is fulfilled once the response is available.
 *
 * The promise resolves to the Response object representing the response to your request.
 *
 * A fetch() promise only rejects when the request fails, for example, because of a
 * badly-formed request URL or a network error. A fetch() promise does not reject if
 * the server responds with HTTP status codes that indicate errors (404, 504, etc.).
 * Instead, a then() handler must check the Response.ok and/or Response.status properties.
 */
declare function fetch(url: string, init?: RequestInit): Promise<Response>;
declare function fetch(request: Request): Promise<Response>;

type ScriptDeveloper = {
    name: string;
    email: string;
    homepage?: string;
};
type ScriptMetadata = {
    name: string;
    icon: string;
    color: Color;
    localizedName: string;
    localizedNames?: Record<string, string>;
    description?: string;
    localizedDescription: string;
    localizedDescriptions?: Record<string, string>;
    version: string;
    author?: ScriptDeveloper;
    contributors?: ScriptDeveloper[];
    remoteResource?: {
        url: string;
        autoUpdateInterval?: number | null;
    };
};
/**
 * Access information about the script, and provides convenient methods to control the scripts.
 *
 */
declare namespace Script {
    /**
     * The environment in which the script is running.
     *  - `"index"`: The script is running in the main app, "index.tsx" is the entry point.
     *  - `"widget"`: The script is running in a widget, "widget.tsx" is the entry point.
     *  - `"notification"`: The script is running in the rich notification extension, "notification.tsx" is the entry point.
     *  - `"intent"`: The script is running in an intent handler, "intent.tsx" is the entry point.
     *  - `"app_intents"`: The script is running in the app intents extension, "app_intents.tsx" is the entry point.
     *  - `"assistant_tool"`: The script is running for the Assistant Tool, "assistant_tool.tsx" is the entry point.
     *  - `"keyboard"`: The script is running in the custom keyboard extension, "keyboard.tsx" is the entry point.
     *  - `"control_widget"`: The script is running in the control widget, "control_widget_button.tsx" or "control_widget_toggle.tsx" is the entry point.
     *  - `"live_activity"`: The script is running in the live activity extension, "live_activity.tsx" is the entry point.
     */
    const env: "index" | "widget" | "intent" | "app_intents" | "notification" | "assistant_tool" | "keyboard" | "control_widget" | "live_activity";
    /**
     * Name of the current script.
     */
    const name: string;
    /**
     * Metadata of the current script.
     *
     * - `name`: The name of the script.
     * - `icon`: The icon of the script, it can be a SFSymbol name.
     * - `color`: The color of the script, it can be a hex color string like `#FF0000` or a CSS color name like `red`.
     * - `localizedName`: The localized name of the script in the current system language.
     * - `localizedNames`: The localized names of the script in different languages, the key is the language code, the value is the localized name.
     * - `description`: The description of the script in English.
     * - `localizedDescription`: The localized description of the script in the current system language.
     * - `localizedDescriptions`: The localized descriptions of the script in different languages, the key is the language code, the value is the localized description.
     * - `version`: The version of the script.
     * - `author`: The author information of the script.
     *    - `name`: The name of the author.
     *    - `email`: The email of the author.
     *    - `homepage`: The homepage of the author.
     * - `contributors`: The contributors information of the script, it is an array of objects with the same structure as `author`.
     * - `remoteResource`: The remote resource information of the script.
     *    - `url`: The URL of the remote resource, it can be a zip file or a git repository.
     *    - `autoUpdateInterval`: The interval for auto-updating the remote resource, in seconds. If not specified, the remote resource will not be auto-updated.
     */
    const metadata: ScriptMetadata;
    /**
     * The directory path of the current script.
     */
    const directory: string;
    /**
     * If a widget on home screen has set the `Parameter` field, and the current script is opened and run
     * after clicking the widget, you can access the configuration from this property.
     */
    const widgetParameter: string;
    /**
     * If the current script is opened and run by the `run URL scheme`(
     * like `"scripting://run/{script_name}?a=1&b=2"`).
     */
    const queryParameters: Record<string, string>;
    /**
     * Creates a URL scheme for opening the Scripting's documentation page.
     * @param title The title of the documentation page, if not specified, it will open the documentation homepage.
     * @returns `"scripting://doc?title=Quick%20Start"`
     */
    function createDocumentationURLScheme(title?: string): string;
    /**
     * Creates a URL scheme for opening a specified script.
     *
     * @param scriptName
     * @returns `"scripting://open/example_script"`
     */
    function createOpenURLScheme(scriptName: string): string;
    /**
     * Creates a URL scheme for running a specified script.
     *
     * @param scriptName The name of script to run
     * @param queryParameters The parameters passed to the script, you can access by `Script.queryParameters`.
     * @returns `"scripting://run/example_script?a=1&b=2"`
     * @example
     *  - Script A: widget.tsx
     * ```tsx
     * async function MyWidget() {
     *   const url = Script.createRunURLScheme("Script A", {
     *     param1: 1,
     *     param2: 2,
     *   })
     *   return (
     *     <Text
     *       widgetURL={url}
     *     >
     *        Run Script A
     *      </Text>
     *   )
     * }
     * ```
     *
     *  - Script A: index.tsx
     * ```tsx
     * import { Script } from 'scripting'
     * console.log(
     *   JSON.stringify(Script.queryParameters)
     * )
     * // output: {"param1": 1, "param2": 2}
     * ```
     */
    function createRunURLScheme(scriptName: string, queryParameters?: Record<string, string>): string;
    /**
     * Create a URL scheme for running a specified script in single mode. Only one instance of the script can be run at the same time.
     *
     * @param scriptName The name of script to run
     * @param queryParameters The parameters passed to the script, you can access by `Script.queryParameters`.
     * @returns `"scripting://run_single/example_script?a=1&b=2"`
     * @example
     *  - Script A: widget.tsx
     * ```tsx
     * async function MyWidget() {
     *   const url = Script.createRunSingleURLScheme("Script A", {
     *     param1: 1,
     *     param2: 2,
     *   })
     *   return (
     *     <Text
     *       widgetURL={url}
     *     >
     *        Run Script A
     *      </Text>
     *   )
     * }
     * ```
     *
     *  - Script A: index.tsx
     * ```tsx
     * import { Script } from 'scripting'
     * console.log(
     *   JSON.stringify(Script.queryParameters)
     * )
     * // output: {"param1": 1, "param2": 2}
     * ```
     */
    function createRunSingleURLScheme(scriptName: string, queryParameters?: Record<string, string>): string;
    /**
     * Creates a URL scheme for the OAuth callback URL. This string used to register the OAuth callback URL in the OAuth provider's settings.
     * @param uniqueID A unique identifier for the OAuth callback URL, it can be any string that uniquely identifies the OAuth flow.
     * @returns `"scripting://oauth_callback/{uniqueID}"`
     * @example
     * ```ts
     * const githubOAuthCallbackURL = Script.createOAuthCallbackURLScheme("github")
     * const githubOAuth = new OAuth2({
     *   // ...
     * })
     * githubOAuth.authorize({
     *   callbackURL: githubOAuthCallbackURL,
     *   // ...
     * }).then((credential) => {
     *   // ...
     * })
     * ```
     */
    function createOAuthCallbackURLScheme(uniqueID: string): string;
    /**
     * Creates a URL scheme for importing scripts from the specified URLs.
     *
     * @param urls An array of URLs to import scripts from.
     * @returns `"scripting://import_scripts?urls=[...]"`
     * @example
     * ```ts
     * const urlScheme = Script.createImportScriptsURLScheme([
     *   "https://github.com/schl3ck/scripting-app-lib",
     *   "https://example.com/my-script.zip",
     * ])
     * console.log(urlScheme) // "scripting://import_scripts?urls=[...]"
     * ```
     */
    function createImportScriptsURLScheme(urls: string[]): string;
    /**
     * Run a script of Scripting.
     *
     * If the script does not exist, `null` is returned directly.
     *
     * **Caution**: Make sure to call `Script.exit()` in the script to avoid memory leaks.
     *
     * @param options
     * @param options.name Name of the script
     * @param options.queryParameters Params passed to the script, you can access by `Script.queryParameters`.
     * @param options.singleMode If `true`, only one instance of the script can be run at the same time, so other script instances will be terminated. Defaults to `false`.
     * @returns The result returned by the script, if the script passes result to `Script.exit(result)`
     *
     * @example
     * ```ts
     * // Script A: index.tsx
     * Script.exit(
     *   Script.queryParameters["name"] + '123'
     * )
     *
     * // Script B: index.tsx
     * async function run() {
     *   const result = await Script.run({
     *     name: 'Script A',
     *     queryParameters: {
     *       name: 'AAAA',
     *     }
     *   })
     *
     *   console.log(result) // output: AAAA123
     * }
     * run()
     * ```
     */
    function run<T>(options: {
        name: string;
        queryParameters?: Record<string, string>;
        singleMode?: boolean;
    }): Promise<T | null>;
    /**
     * Exit current script.
     *
     *  - When a script is called by another script, it can return a value that can be serialized by `JSON.stringify` as a result.
     *  - When a script is run by a shortcut action or share sheet, it can return an `IntentValue` as a processing result.
     * @param result The result to deliver back to the initiator.
     */
    function exit(result?: any | IntentTextValue | IntentJsonValue | IntentFileURLValue | IntentFileValue | IntentURLValue | IntentAttributedTextValue): void;
    /**
     * Determine whether user has full access to the Scripting PRO features.
     *
     * @returns `true` if the user has full access to the Scripting PRO features, otherwise `false`.
     */
    function hasFullAccess(): boolean;
}

/**
 * Values that define the widget’s size and shape.
 *
 *  - `systemSmall`: The small system widget can appear on the Home Screen or in the Today View in iOS and iPadOS. Starting with iPadOS 17, it also appears on the iPad Lock Screen. In macOS, the small system widget can appear on the desktop or in Notification Center.
 *  - `systemMedium`: The medium system widget can appear on the Home Screen or in the Today View in iOS and iPadOS. In macOS, the medium system widget can appear on the desktop or in Notification Center.
 *  - `systemLarge`: The large system widget can appear on the Home Screen or in the Today View in iOS and iPadOS. In macOS, the large system widget can appear on the desktop or in Notification Center.
 *  - `systemExtraLarge`: The extra-large system widget can appear on the Home Screen or in the Today View in iPadOS. In macOS, the extra-large system widget can appear on the desktop or in Notification Center.
 *  - `accessoryCircular`: The accessory circular widget can appear as a complication in watchOS, or on the Lock Screen in iOS and iPadOS.
 *  - `accessoryRectangular`: In watchOS, the accessory rectangular widget can appear as a widget in the Smart Stack or as a complication on a watch face. In iOS and iPadOS, it can appear on the Lock Screen.
 *  - `accessoryInline`: A flat widget that contains a single row of text and an optional image. The accessory inline widget can appear as a complication in watchOS, or on the Lock Screen in iOS and iPadOS. On some watch faces, the system renders the complication along a curve.
 */
type WidgetFamily = "systemSmall" | "systemMedium" | "systemLarge" | "systemExtraLarge" | "accessoryCircular" | "accessoryRectangular" | "accessoryInline";
type WidgetDisplaySize = {
    width: number;
    height: number;
};
/**
 * A type that indicates the earliest date widget reload.
 *  - `never`: A policy that specifies that the app prompts WidgetKit when a new timeline is available.
 *  - `atEnd`: A policy that specifies that WidgetKit requests a new timeline after the last date in a timeline passes.
 *  - `after`: A policy that specifies a future date for WidgetKit to request a new timeline.
 */
type WidgetReloadPolicy = {
    policy: "never" | "atEnd";
} | {
    policy: "after";
    date: Date;
};
/**
 * This interface provides some operations for Widget.
 */
declare namespace Widget {
    /**
     * The user-configured family of the widget.
     */
    const family: WidgetFamily;
    /**
     * The size, in points, of the widget.
     */
    const displaySize: WidgetDisplaySize;
    /**
     * If a widget on home screen has set the `Parameter` field, and the current script is opened and run
     * after clicking the widget, you can access the configuration from this property.
     */
    const parameter: string;
    /**
     * Present the widget UI.
     * @param node UI for rendering widget content.
     * @param reloadPolicy The policy that determines the earliest date and time WidgetKit requests a new timeline from a timeline provider. Defaults to `atEnd`.
     * @example
     * ```tsx
     * function WidgetView() {
     *   return <VStack>
     *     <Image
     *       systemName="globe"
     *       resizable
     *       scaleToFit
     *       frame={{
     *         width: 28,
     *         height: 28
     *       }}
     *     />
     *     <Text>Hello Scripting!</Text>
     *   </VStack>
     * }
     *
     * Widget.present(<WidgetView />, {
     *   // reload 5 minutes later
     *   policy: "after",
     *   date: new Date(Date.now() + 1000 * 60 * 5)
     * })
     * ```
     */
    function present(node: VirtualNode, reloadPolicy?: WidgetReloadPolicy): void;
    /**
     * Previews the widget with the specified parameters. This method allows you to preview how the widget will look with different parameters. You should only call this method in the `index.tsx` context, it's not available in other environments like `widget.tsx` or `intent.tsx`.
     * @param options The options for previewing the widget.
     * @param options.family The family of the widget to preview. Defaults to `systemSmall`.
     * @param options.parameters The parameters for the widget preview.
     * @param options.parameters.options A record of parameter names and their values. The values should be JSON strings that can be parsed into objects.
     * @param options.parameters.default The name of the default parameter to use in the preview.
     * @returns A promise that resolves when the preview is dismissed. It will throw an error if the parameters are not set correctly.
     * @example
     * ```tsx
     * const options = {
     *   "Param 1": JSON.stringify({
     *     "color": "red"
     *    }),
     *   "Param 2":  JSON.stringify({
     *     "color": "blue"
     *   }),
     * }
     * await Widget.preview({
     *   family: "systemSmall",
     *   parameters: {
     *     options,
     *     default: "Param 1"
     *   }
     * })
     * console.log("Widget preview dismissed")
     * ```
     */
    function preview<K extends string>(options?: {
        family?: WidgetFamily;
        parameters?: {
            options: Record<K, string>;
            default: K;
        };
    }): Promise<void>;
    /**
     * Reloads the timelines for all configured widgets.
     */
    function reloadAll(): void;
    /**
     * Reloads the timelines for all User Widgets.
     */
    function reloadUserWidgets(): void;
    /**
     * Reloads the timelines for all Test Widgets.
     */
    function reloadTestWidgets(): void;
}

declare const Device: typeof globalThis.Device;

declare global {
    namespace JSX {
        interface Element extends VirtualNode {
        }
        interface ElementChildrenAttribute {
            children: {};
        }
        interface IntrinsicAttributes extends IdProps, CommonViewProps {
        }
    }
}

export { AbortController, AbortError, AbortEvent, type AbortEventListener, AbortSignal, AccessoryWidgetBackground, type AdaptableTabBarPlacement, type Alignment, type Angle, type AngleValue, type AngularGradient, AnimatedFrames, type AnimatedFramesProps, AnimatedGif, type AnimatedGifProps, AnimatedImage, type AnimatedImageProps, type AnnotationOverflowResolution, type AnnotationOverflowResolutionStrategy, type AnnotationPosition, AppEventListenerManager, AppEvents, type AppIntent, type AppIntentFactory, AppIntentManager, type AppIntentPerform, AppIntentProtocol, AreaChart, AreaStackChart, type Axis, type AxisSet, type BadgeProminence, Bar1DChart, BarChart, type BarChartProps, BarGanttChart, type BarGanttChartProps, BarStackChart, Button, type ButtonBorderShape, type ButtonProps, type ButtonRole, type ButtonStyle, type CalendarComponent, CancelError, type CancelEventListener, CancelToken, type CancelTokenHook, Capsule, Chart, type ChartAxisScaleType, type ChartInterpolationMethod, type ChartMarkProps, type ChartMarkStackingMethod, type ChartNumberSelection, type ChartScrollPosition, type ChartSelection, type ChartStringSelection, type ChartSymbolShape, Circle, type ClockHandRotationEffectPeriod, type ClosedRange, type Color, ColorPicker, type ColorPickerProps, type ColorScheme, type ColorSchemeContrast, type ColorStringHex, type ColorStringRGBA, type ColorWithGradientOrOpacity, type CommonViewProps, type ComponentCallback, type ComponentEffect, type ComponentEffectEvent, type ComponentMemo, type ComponentProps, ConcentricRectangle, type ConcentricRectangleProps, type ConcentricRectangleShape, type Consumer, type ConsumerProps, type ContentAvailableViewProps, type ContentAvailableViewWithLabelProps, type ContentAvailableViewWithTitleProps, type ContentMarginPlacement, type ContentMode, type ContentShapeKinds, type ContentTransition, ContentUnavailableView, type Context, ControlGroup, type ControlGroupProps, type ControlGroupStyle, type ControlSize, ControlWidget, ControlWidgetButton, type ControlWidgetButtonProps, type ControlWidgetLabel, ControlWidgetToggle, type ControlWidgetToggleProps, type Cookie, DateIntervalLabel, type DateIntervalLabelProps, DateLabel, type DateLabelProps, DatePicker, type DatePickerComponents, type DatePickerProps, type DatePickerStyle, DateRangeLabel, type DateRangeLabelProps, DefaultToolbarItem, type DefaultToolbarItemProps, Device, DisclosureGroup, type DisclosureGroupProps, type DiscreteSymbolEffect, type Dispatch, Divider, DonutChart, DragGesture, type DragGestureDetails, type DragGestureOptions, type DurationInMilliseconds, type DynamicImageSource, type DynamicShapeStyle, type Edge, type EdgeCornerStyle, type EdgeInsets, type EdgeSet, type EdgeSetOption, EditButton, Editor, type EditorProps, type EffectDestructor, type EffectSetup, Ellipse, EmptyView, type EnvironmentValues, EnvironmentValuesReader, type EnvironmentValuesReaderProps, type FileImageProps, FlowLayout, type FlowLayoutProps, type Font, type FontDesign, type FontWeight, type FontWidth, ForEach, type ForEachComponent, type ForEachDeprecatedProps, type ForEachProps, Form, FormData, type FormProps, type FormStyle, type FunctionComponent, Gauge, type GaugeProps, type GaugeStyle, type GeometryProxy, GeometryReader, type GeometryReaderProps, type Gesture, GestureInfo, GlassEffectContainer, type GlassEffectContainerProps, type Gradient, type GradientStop, Grid, type GridItem, type GridProps, GridRow, type GridRowProps, type GridSize, Group, GroupBox, type GroupBoxProps, type GroupProps, HStack, type HStackProps, Headers, type HeadersInit, HeatMapChart, type HorizontalAlignment, type HorizontalEdge, type HorizontalEdgeSet, type IdProps, Image, type ImageInterpolation, type ImageProps, type ImageRenderOptions, ImageRenderer, type ImageRenderingBehaviorProps, type ImageRenderingMode, type ImageResizable, type ImageResizingMode, type ImageScale, type IndexViewStyle, Intent, IntentAttributedTextValue, IntentFileURLValue, IntentFileValue, IntentJsonValue, IntentRequestConfirmationValue, IntentSnippetIntentValue, IntentTextValue, IntentURLValue, IntentValue, type InternalWidgetRender, type KeyboardType, type KeywordPoint, type KeywordsColor, Label, type LabelProps, type LabelStyle, LazyHGrid, type LazyHGridProps, LazyHStack, type LazyHStackProps, LazyVGrid, type LazyVGridProps, LazyVStack, type LazyVStackProps, LineCategoryChart, LineChart, type LineStylePattern, type LinearGradient, Link, type LinkProps, List, type ListProps, type ListSectionSpacing, type ListStyle, LiveActivity, type LiveActivityActivitiesEnabledListener, type LiveActivityActivityUpdateListener, type LiveActivityDetail, type LiveActivityEndOptions, type LiveActivityOptions, type LiveActivityState, LiveActivityUI, type LiveActivityUIBuilder, LiveActivityUIExpandedBottom, LiveActivityUIExpandedCenter, LiveActivityUIExpandedLeading, LiveActivityUIExpandedTrailing, type LiveActivityUIExpandedViewProps, type LiveActivityUIProps, type LiveActivityUpdateOptions, LongPressGesture, type LongPressGestureOptions, MagnifyGesture, type MagnifyGestureValue, type MarkDimension, Markdown, type MarkdownProps, type MatchedGeometryProperties, type Material, Menu, type MenuProps, type MenuStyle, type MeshGradient, type ModalPresentation, type ModalPresentationStyle, MultiColumnsPicker, type MultiColumnsPickerProps, MultiPicker, type MutableRefObject, NamespaceReader, type NamespaceReaderProps, Navigation, type NavigationBarTitleDisplayMode, NavigationLink, type NavigationLinkProps, NavigationSplitView, type NavigationSplitViewColumn, type NavigationSplitViewProps, type NavigationSplitViewStyle, type NavigationSplitViewVisibility, NavigationStack, type NavigationStackProps, type NetworkImageProps, type NormalProgressViewProps, Notification, type NotificationAction, type NotificationInfo, type NotificationInterruptionLevel, type NotificationRequest, Path, Picker, type PickerProps, type PickerStyle, type PickerValue, PieChart, type PinnedScrollViews, type Point, Point1DChart, PointCategoryChart, PointChart, type PopoverPresentation, type PresentationAdaptation, type PresentationBackgroundInteraction, type PresentationContentInteraction, type PresentationDetent, ProgressView, type ProgressViewProps, type ProgressViewStyle, type Prominence, type Provider, type ProviderProps, QRImage, type QRImageProps, type RadialGradient, RangeAreaChart, ReadableStream, ReadableStreamDefaultController, ReadableStreamDefaultReader, RectAreaChart, RectChart, type RectCornerRadii, type RectWithCornerRadii, type RectWithCornerRadius, type RectWithCornerSize, Rectangle, type Reducer, type ReducerAction, type ReducerState, type RefObject, type RenderNode, Request, type RequestInit, Response, type ResponseInit, RotateGesture, type RotateGestureValue, type RoundedCornerStyle, RoundedRectangle, type RoundedRectangleProps, RuleChart, RuleLineForLabelChart, RuleLineForValueChart, SVG, type SVGCodeSourceProps, type SVGFilePathSourceProps, type SVGProps, type SVGURLSourceProps, type SafeAreaRegions, type ScenePhase, Script, type ScriptDeveloper, type ScriptMetadata, type ScriptingDeviceInfo, type ScrollDismissesKeyboardMode, type ScrollScrollIndicatorVisibility, type ScrollTargetBehavior, ScrollView, type ScrollViewProps, type ScrollViewProxy, ScrollViewReader, type ScrollViewReaderProps, type SearchFieldPlacement, type SearchSuggestionsPlacementSet, Section, type SectionProps, SecureField, type SecureFieldProps, type SensoryFeedback, type SetStateAction, type Shape, type ShapeProps, type ShapeStyle, type ShortcutFileURLParameter, type ShortcutJsonParameter, type ShortcutParameter, type ShortcutTextParameter, type Size, Slider, type SliderProps, type SliderWithLabelProps, type SliderWithRangeValueLabelsProps, type SliderWithTicksProps, Spacer, type StateInitializer, Stepper, type StepperProps, type StrokeStyle, type StyledText, type SubmitTriggers, type SwingAnimation, type SymbolEffect, type SymbolRenderingMode, type SymbolVariants, type SystemImageProps, Tab, type TabCustomizationBehavior, type TabPlacement, type TabProps, type TabRole, TabSection, type TabSectionProps, TabView, type TabViewProps, type TabViewStyle, TapGesture, Text, type TextAlignment, TextField, type TextFieldProps, type TextFieldStyle, type TextInputAutocapitalization, type TextProps, TimerIntervalLabel, type TimerIntervalLabelProps, type TimerIntervalProgressViewProps, Toggle, type ToggleProps, type ToggleStyle, type ToolBarProps, Toolbar, type ToolbarDefaultItemKind, ToolbarItem, ToolbarItemGroup, type ToolbarItemGroupProps, type ToolbarItemPlacement, type ToolbarItemProps, type ToolbarPlacement, ToolbarSpacer, type ToolbarSpacerProps, type ToolbarSpacerSizing, type ToolbarTitleDisplayMode, type TruncationMode, type UIImageProps, type UnderlineStyle, type UnderlyingSource, UnevenRoundedRectangle, type UnevenRoundedRectangleProps, type UserInterfaceSizeClass, VStack, type VStackProps, type VerticalAlignment, type VerticalEdge, type VerticalEdgeSet, VideoPlayer, type VideoPlayerProps, ViewModifiers, type VirtualNode, type Visibility, WebView, type WebViewProps, Widget, type WidgetAccentedRenderingMode, type WidgetDisplaySize, type WidgetFamily, type WidgetReloadPolicy, type WidgetRenderingMode, ZStack, type ZStackProps, createContext, fetch, formDataToJson, gradient, modifiers, useCallback, useCancelToken, useColorScheme, useContext, useEffect, useEffectEvent, useKeyboardVisible, useMemo, useObservable, useReducer, useRef, useSelector, useState };
