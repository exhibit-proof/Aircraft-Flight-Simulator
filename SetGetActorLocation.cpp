// Copyright 2019 The MathWorks, Inc.
#include "SetGetActorLocation.h"

// Sets default values
ASetGetActorLocation::ASetGetActorLocation() :SignalReader(nullptr), SignalWriter(nullptr)
{
    PrimaryActorTick.bCanEverTick = true;
    // Set this pawn to be controlled by the lowest-numbered player
    AutoPossessPlayer = EAutoReceiveInput::Player0;
    // Create a dummy root component we can attach things to.
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("RootComponent"));
    // Create a camera and a visible object
    OurCamera = CreateDefaultSubobject<UCameraComponent>(TEXT("OurCamera"));
    OurVisibleComponent = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("OurVisibleComponent"));

    // "C:\Users\ethar\Simulation\Aquila\Content\SelectedPlane.stl"
    InStaticMesh = UUnrealSTLFunctionLibrary::LoadStaticMeshFromSTLFile(FString("C:/Users/ethar/Simulation/Aquila/Content/SelectedPlane.stl"), FUnrealSTLConfig(), FUnrealSTLStaticMeshConfig());
    OurVisibleComponent->SetStaticMesh(InStaticMesh);
    //OurVisibleComponent.bHiddenInGame = false;

    // Attach our camera and visible object to our root component. Offset and rotate the camera.
    OurCamera->SetupAttachment(RootComponent);
    OurCamera->SetRelativeLocation(FVector(-700.0f, 0.0f, 500.0f));
    OurCamera->SetRelativeRotation(FRotator(-40.0f, 0.0f, 0.0f));
    OurVisibleComponent->SetupAttachment(RootComponent);
}

void ASetGetActorLocation::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    if (!CurrentVelocity.IsZero())
    {
        // Bad interpolation
        //CurrentLocation += (CurrentVelocity * DeltaTime);
        SetActorLocation(CurrentLocation);
        SetActorRotation(CurrentRotation);
    }
}

void ASetGetActorLocation::SetupPlayerInputComponent(class UInputComponent* PlayerInput)
{
    Super::SetupPlayerInputComponent(PlayerInput);

    InputComponent->BindAxis("MoveX", this, &ASetGetActorLocation::Move_XAxis);
    InputComponent->BindAxis("MoveY", this, &ASetGetActorLocation::Move_YAxis);
}

void ASetGetActorLocation::Move_XAxis(float AxisValue)
{
    //SetCameraLocation
    //OurCamera->SetRelativeLocation(Translations);
    //OurCamera->SetRelativeRotation(Rotations);

    //if (Sim3DCamera)
    //{
    //    Sim3DCamera->SetActorLocation(SomeNewLocation);
    //    Sim3DCamera->SetActorRotation(SomeNewRotation);
    //}

}

void ASetGetActorLocation::Move_YAxis(float AxisValue)
{
    //OurCamera->SetRelativeLocation(Translations);
    //OurCamera->SetRelativeRotation(Rotations);
}

void ASetGetActorLocation::Sim3dSetup()
{
    Super::Sim3dSetup();

    
    //APlayerController* PlayerController = UGameplayStatics::GetPlayerController(GetWorld(), 0);
    //if (PlayerController && Sim3DCamera)
    //{
    //    PlayerController->SetViewTarget(Sim3DCamera);
    //}

    /*
    TArray<AActor*> FoundActors;
    UGameplayStatics::GetAllActorsWithTag(GetWorld(), FName("Camera1"), FoundActors);

    // Iterate through the found actors and look for a camera component
    for (AActor* Actor : FoundActors)
    {
        if (Actor)
        {
            // Assuming the actor has a camera component, get the camera component
            UCameraComponent* CameraComponent = Actor->FindComponentByClass<UCameraComponent>();
            if (CameraComponent)
            {
                // Set the player's view target to this camera
                APlayerController* PlayerController = GetWorld()->GetFirstPlayerController();
                if (PlayerController)
                {
                    PlayerController->SetViewTargetWithBlend(Actor, 0.5f); // Smooth transition
                }
                break;  // Exit the loop once the camera is found
            }
        }
    }*/

    //// Define the path to your STL file (relative to the project directory or assets)
    //FString STLFilePath = FPaths::ProjectContentDir() + TEXT("Model/Cessna.stl");

    //// Define config objects (use default or custom configurations if needed)
    //FUnrealSTLConfig Config;
    //FUnrealSTLStaticMeshConfig StaticMeshConfig;

    //// Load the static mesh from the STL file using the plugin function
    //UStaticMesh* LoadedMesh = UUnrealSTL::LoadStaticMeshFromSTLFile(STLFilePath, Config, StaticMeshConfig);

    //// Check if the mesh was loaded successfully
    //if (LoadedMesh)
    //{
    //    // Set the loaded mesh on your MeshComponent
    //    MeshComponent->SetStaticMesh(LoadedMesh);
    //}
    //else
    //{
    //    UE_LOG(LogTemp, Warning, TEXT("Failed to load STL mesh from file!"));
    //}

    if (Tags.Num() != 0) {
        unsigned int numElements = 6;
        FString tagName = Tags.Top().ToString();

        FString SignalReaderTag = tagName;
        SignalReaderTag.Append(TEXT("Set"));
        SignalReader = StartSimulation3DMessageReader(TCHAR_TO_ANSI(*SignalReaderTag), sizeof(double) * numElements);

        FString SignalWriterTag = tagName;
        SignalWriterTag.Append(TEXT("Get"));
        SignalWriter = StartSimulation3DMessageWriter(TCHAR_TO_ANSI(*SignalWriterTag), sizeof(double) * numElements);
    }
}

void ASetGetActorLocation::Sim3dStep(float DeltaSeconds)
{
    unsigned int numElements = 6;
    double array[6];
    int statusR = ReadSimulation3DMessage(SignalReader, sizeof(double) * numElements, array);

    double theta = array[0] * 0.01745329251; // Deg to radians
    double phi = array[1] * 0.01745329251; // Deg to radians
    double altitude = array[2];
    FVector NewLocation;
    NewLocation.X = cos(theta) * sin(phi) * altitude;
    NewLocation.Y = sin(theta) * sin(phi) * altitude;
    NewLocation.Z = cos(phi) * altitude;

    FRotator NewRotation;
    NewRotation.Roll = array[3] + array[0];
    NewRotation.Pitch = array[4] - array[1];
    NewRotation.Yaw = array[5];

    CurrentVelocity = (NewLocation - CurrentLocation) / DeltaSeconds;
    CurrentLocation = NewLocation;
    CurrentRotation = NewRotation;

    double fvector[6] = { NewLocation.X, NewLocation.Y, NewLocation.Z, NewRotation.Roll, NewRotation.Pitch, NewRotation.Yaw };
    int statusW = WriteSimulation3DMessage(SignalWriter, sizeof(double) * numElements, fvector);
}

void ASetGetActorLocation::Sim3dRelease()
{
    Super::Sim3dRelease();
    if (SignalReader) {
        StopSimulation3DMessageReader(SignalReader);
    }
    SignalReader = nullptr;

    if (SignalWriter) {
        StopSimulation3DMessageWriter(SignalWriter);
    }
    SignalWriter = nullptr;
}